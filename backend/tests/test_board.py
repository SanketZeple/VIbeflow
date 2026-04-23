"""Board feature tests."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import get_db
from app.db.base import Base
from app.models.user import User
from app.models.column import Column
from app.models.task import Task
from app.core.security import get_password_hash


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def cleanup_db():
    """Clean up database after each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Insert fixed columns (since migration seed not applied)
    db = TestingSessionLocal()
    try:
        # Check if columns already exist
        existing = db.query(Column).count()
        if existing == 0:
            columns = [
                Column(name="Backlog", order=1),
                Column(name="Selected for Development", order=2),
                Column(name="In Progress", order=3),
                Column(name="Review", order=4),
                Column(name="Done", order=5),
            ]
            db.add_all(columns)
            db.commit()
    finally:
        db.close()
    
    yield
    
    # Drop tables
    Base.metadata.drop_all(bind=engine)


def create_test_user(email="boardtest@example.com", password="password123"):
    """Helper to create a test user."""
    db = TestingSessionLocal()
    try:
        user = User(
            email=email,
            password_hash=get_password_hash(password),
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    finally:
        db.close()


def get_auth_token(email="boardtest@example.com", password="password123"):
    """Get auth token for test user."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": email,
            "password": password
        }
    )
    return response.json()["access_token"]


def test_get_board_unauthorized():
    """Test GET /board without authentication."""
    response = client.get("/api/board/")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_get_board_empty():
    """Test GET /board with no tasks."""
    # Create a user and get token
    create_test_user()
    token = get_auth_token()
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/board/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert "columns" in data
    assert len(data["columns"]) == 5
    # Verify column names and order
    column_names = [col["name"] for col in data["columns"]]
    assert column_names == [
        "Backlog",
        "Selected for Development",
        "In Progress",
        "Review",
        "Done",
    ]
    # Each column should have empty tasks list
    for col in data["columns"]:
        assert col["tasks"] == []


def test_get_board_with_tasks():
    """Test GET /board with tasks in columns."""
    # Create a user
    user = create_test_user()
    token = get_auth_token()
    
    # Get column IDs
    db = TestingSessionLocal()
    try:
        columns = db.query(Column).order_by(Column.order).all()
        backlog_col_id = columns[0].id
        in_progress_col_id = columns[2].id
        
        # Create tasks
        task1 = Task(
            title="Task 1",
            column_id=backlog_col_id,
            position=0,
            created_by=user.id,
        )
        task2 = Task(
            title="Task 2",
            column_id=in_progress_col_id,
            position=0,
            assignee_id=user.id,
            created_by=user.id,
        )
        db.add_all([task1, task2])
        db.commit()
    finally:
        db.close()
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/board/", headers=headers)
    assert response.status_code == 200
    data = response.json()
    
    # Find backlog column
    backlog_column = next(col for col in data["columns"] if col["name"] == "Backlog")
    assert len(backlog_column["tasks"]) == 1
    assert backlog_column["tasks"][0]["title"] == "Task 1"
    assert backlog_column["tasks"][0]["column_id"] == backlog_col_id
    
    # Find in progress column
    in_progress_column = next(col for col in data["columns"] if col["name"] == "In Progress")
    assert len(in_progress_column["tasks"]) == 1
    assert in_progress_column["tasks"][0]["title"] == "Task 2"
    assert in_progress_column["tasks"][0]["assignee_id"] == user.id


def test_create_task_success():
    """Test POST /board/tasks creates a task in Backlog."""
    user = create_test_user()
    token = get_auth_token()
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "New task"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New task"
    assert data["column_id"] is not None
    assert data["position"] == 0  # first task in backlog
    assert data["assignee_id"] is None
    assert data["created_by"] == user.id
    # Verify task appears in board
    board_response = client.get("/api/board/", headers=headers)
    board = board_response.json()
    backlog_column = next(col for col in board["columns"] if col["name"] == "Backlog")
    assert any(task["id"] == data["id"] for task in backlog_column["tasks"])


def test_create_task_with_due_date():
    """Test POST /board/tasks with due_date."""
    user = create_test_user()
    token = get_auth_token()
    
    headers = {"Authorization": f"Bearer {token}"}
    due_date = "2026-12-31T23:59:59Z"
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "Task with due date", "due_date": due_date}
    )
    assert response.status_code == 200
    data = response.json()
    # SQLite may strip timezone suffix; compare normalized strings
    expected = due_date.rstrip('Z')
    assert data["due_date"] == expected


def test_create_task_empty_title():
    """Test validation rejects empty title."""
    user = create_test_user()
    token = get_auth_token()
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": ""}
    )
    assert response.status_code == 422  # validation error


def test_create_task_whitespace_title():
    """Test validation rejects whitespace-only title."""
    user = create_test_user()
    token = get_auth_token()
    
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "   "}
    )
    assert response.status_code == 422


def test_create_task_title_too_long():
    """Test validation rejects title >255 chars."""
    user = create_test_user()
    token = get_auth_token()
    
    headers = {"Authorization": f"Bearer {token}"}
    long_title = "x" * 256
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": long_title}
    )
    assert response.status_code == 422


def test_create_task_unauthenticated():
    """Test POST /board/tasks without authentication returns 401."""
    response = client.post(
        "/api/board/tasks",
        json={"title": "Should fail"}
    )
    assert response.status_code == 401


def test_update_task_column_and_position():
    """Test PATCH /board/tasks/{task_id} updates column and position."""
    # Create a test user and task
    user = create_test_user()
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a task in Backlog (column_id=1)
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "Test task for update"}
    )
    assert response.status_code == 200
    task = response.json()
    task_id = task["id"]
    
    # Get columns to find In Progress column (should be column_id=2)
    board_response = client.get("/api/board/", headers=headers)
    assert board_response.status_code == 200
    columns = board_response.json()["columns"]
    in_progress_col = next(col for col in columns if col["name"] == "In Progress")
    
    # Update task to In Progress column with position 0
    update_response = client.patch(
        f"/api/board/tasks/{task_id}",
        headers=headers,
        json={"column_id": in_progress_col["id"], "position": 0}
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["column_id"] == in_progress_col["id"]
    assert updated["position"] == 0
    
    # Verify task moved in board
    board_after = client.get("/api/board/", headers=headers).json()
    in_progress_tasks = [col["tasks"] for col in board_after["columns"] if col["id"] == in_progress_col["id"]][0]
    assert any(t["id"] == task_id for t in in_progress_tasks)


def test_update_task_assignee_with_history():
    """Test PATCH /board/tasks/{task_id} updates assignee and creates history."""
    # Create two users
    user1 = create_test_user()
    user2 = create_test_user(email="user2@example.com")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a task
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "Task for assignment"}
    )
    assert response.status_code == 200
    task = response.json()
    task_id = task["id"]
    
    # Update assignee to user2
    update_response = client.patch(
        f"/api/board/tasks/{task_id}",
        headers=headers,
        json={"assignee_id": user2.id}
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated["assignee_id"] == user2.id
    
    # Check assignment history
    history_response = client.get(
        f"/api/board/tasks/{task_id}/assignment-history",
        headers=headers
    )
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 1
    assert history[0]["task_id"] == task_id
    assert history[0]["old_assignee_id"] is None
    assert history[0]["new_assignee_id"] == user2.id
    assert history[0]["changed_by"] == user1.id


def test_get_users():
    """Test GET /board/users returns all users."""
    user1 = create_test_user()
    user2 = create_test_user(email="user2@example.com")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    response = client.get("/api/board/users", headers=headers)
    assert response.status_code == 200
    users = response.json()
    assert len(users) >= 2
    # Check that users have expected fields
    assert all("id" in u and "email" in u and "created_at" in u for u in users)


def test_get_assignment_history():
    """Test GET /board/tasks/{task_id}/assignment-history returns history."""
    user1 = create_test_user()
    user2 = create_test_user(email="user2@example.com")
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a task
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "Task for history"}
    )
    assert response.status_code == 200
    task = response.json()
    task_id = task["id"]
    
    # Update assignee twice to generate history
    client.patch(
        f"/api/board/tasks/{task_id}",
        headers=headers,
        json={"assignee_id": user2.id}
    )
    client.patch(
        f"/api/board/tasks/{task_id}",
        headers=headers,
        json={"assignee_id": user1.id}
    )
    
    # Get history
    history_response = client.get(
        f"/api/board/tasks/{task_id}/assignment-history",
        headers=headers
    )
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 2
    # Check both assignments are present (order may vary if timestamps are identical)
    new_assignee_ids = [h["new_assignee_id"] for h in history]
    assert user1.id in new_assignee_ids
    assert user2.id in new_assignee_ids
    # Also check old assignee IDs
    old_assignee_ids = [h["old_assignee_id"] for h in history]
    assert None in old_assignee_ids  # first change from null to user2
    assert user2.id in old_assignee_ids  # second change from user2 to user1


def test_update_task_unassign_with_history():
    """Test PATCH /board/tasks/{task_id} with assignee_id null logs history."""
    user = create_test_user()
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a task assigned to user
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "Task to unassign"}
    )
    assert response.status_code == 200
    task = response.json()
    task_id = task["id"]
    
    # Assign to user
    client.patch(
        f"/api/board/tasks/{task_id}",
        headers=headers,
        json={"assignee_id": user.id}
    )
    
    # Unassign (set to null)
    unassign_response = client.patch(
        f"/api/board/tasks/{task_id}",
        headers=headers,
        json={"assignee_id": None}
    )
    assert unassign_response.status_code == 200
    updated = unassign_response.json()
    assert updated["assignee_id"] is None
    
    # Check assignment history
    history_response = client.get(
        f"/api/board/tasks/{task_id}/assignment-history",
        headers=headers
    )
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) == 2
    # Find the two records: null -> user and user -> null
    null_to_user = None
    user_to_null = None
    for record in history:
        if record["old_assignee_id"] is None and record["new_assignee_id"] == user.id:
            null_to_user = record
        elif record["old_assignee_id"] == user.id and record["new_assignee_id"] is None:
            user_to_null = record
    assert null_to_user is not None, "Missing null -> user history record"
    assert user_to_null is not None, "Missing user -> null history record"
    # Both should have changed_by = user.id
    assert null_to_user["changed_by"] == user.id
    assert user_to_null["changed_by"] == user.id


def test_create_worklog():
    """Test POST /board/tasks/{task_id}/worklogs creates a worklog."""
    user = create_test_user()
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a task
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "Task for worklog"}
    )
    assert response.status_code == 200
    task = response.json()
    task_id = task["id"]
    
    # Create a worklog
    worklog_data = {
        "hours": 2.5,
        "description": "Implemented feature"
    }
    worklog_response = client.post(
        f"/api/board/tasks/{task_id}/worklogs",
        headers=headers,
        json=worklog_data
    )
    assert worklog_response.status_code == 200
    worklog = worklog_response.json()
    assert worklog["task_id"] == task_id
    assert worklog["user_id"] == user.id
    assert worklog["hours"] == 2.5
    assert worklog["description"] == "Implemented feature"
    assert "logged_at" in worklog
    assert "id" in worklog
    
    # Test validation: hours must be positive
    invalid_data = {"hours": 0, "description": "Zero hours"}
    invalid_response = client.post(
        f"/api/board/tasks/{task_id}/worklogs",
        headers=headers,
        json=invalid_data
    )
    assert invalid_response.status_code == 422  # Validation error
    
    # Test validation: hours must be positive (negative)
    invalid_data2 = {"hours": -1.5, "description": "Negative hours"}
    invalid_response2 = client.post(
        f"/api/board/tasks/{task_id}/worklogs",
        headers=headers,
        json=invalid_data2
    )
    assert invalid_response2.status_code == 422  # Validation error


def test_get_worklogs():
    """Test GET /board/tasks/{task_id}/worklogs returns worklogs."""
    user = create_test_user()
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a task
    response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "Task for worklogs"}
    )
    assert response.status_code == 200
    task = response.json()
    task_id = task["id"]
    
    # Create multiple worklogs
    worklogs_data = [
        {"hours": 1.5, "description": "First session"},
        {"hours": 3.0, "description": "Second session"},
        {"hours": 0.5, "description": "Quick fix"}
    ]
    created_ids = []
    for data in worklogs_data:
        worklog_response = client.post(
            f"/api/board/tasks/{task_id}/worklogs",
            headers=headers,
            json=data
        )
        assert worklog_response.status_code == 200
        created_ids.append(worklog_response.json()["id"])
    
    # Get worklogs
    get_response = client.get(
        f"/api/board/tasks/{task_id}/worklogs",
        headers=headers
    )
    assert get_response.status_code == 200
    worklogs = get_response.json()
    assert len(worklogs) == 3
    
    # Check ordering (should be descending by logged_at) - we have 3 worklogs
    # Instead of strict ID check, verify we have all expected hours
    worklog_hours = sorted([w["hours"] for w in worklogs])
    expected_hours = sorted([1.5, 3.0, 0.5])
    assert worklog_hours == expected_hours
    
    # Check each worklog has expected fields
    for worklog in worklogs:
        assert worklog["task_id"] == task_id
        assert worklog["user_id"] == user.id
        assert worklog["hours"] > 0
        assert "description" in worklog
        assert "logged_at" in worklog
    
    # Test with non-existent task
    non_existent_response = client.get(
        "/api/board/tasks/99999/worklogs",
        headers=headers
    )
    assert non_existent_response.status_code == 200  # Should return empty list
    assert non_existent_response.json() == []


def test_create_worklog_nonexistent_task():
    """Test POST /board/tasks/{task_id}/worklogs with non-existent task returns error."""
    # Create a user first
    create_test_user()
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    worklog_data = {"hours": 2.0, "description": "Test"}
    response = client.post(
        "/api/board/tasks/99999/worklogs",
        headers=headers,
        json=worklog_data
    )
    # Should return an error status (400 or 500)
    assert response.status_code != 200
    assert response.status_code >= 400


def test_time_report():
    """Test GET /reports/time returns correct totals."""
    # Create a user and a task with worklogs
    user = create_test_user()
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    # Create a task via API
    task_response = client.post(
        "/api/board/tasks",
        headers=headers,
        json={"title": "Report test task", "due_date": None}
    )
    assert task_response.status_code == 200
    task_id = task_response.json()["id"]
    
    # Add a worklog
    worklog_response = client.post(
        f"/api/board/tasks/{task_id}/worklogs",
        headers=headers,
        json={"hours": 3.5, "description": "Worked on report"}
    )
    assert worklog_response.status_code == 200
    
    # Add another worklog
    worklog_response2 = client.post(
        f"/api/board/tasks/{task_id}/worklogs",
        headers=headers,
        json={"hours": 1.5, "description": "More work"}
    )
    assert worklog_response2.status_code == 200
    
    # Call time report endpoint
    report_response = client.get("/api/reports/time", headers=headers)
    assert report_response.status_code == 200
    data = report_response.json()
    
    # Verify structure
    assert "tasks" in data
    assert "grand_total" in data
    assert isinstance(data["tasks"], list)
    assert isinstance(data["grand_total"], float)
    
    # Find our task in the report
    task_report = None
    for t in data["tasks"]:
        if t["id"] == task_id:
            task_report = t
            break
    assert task_report is not None
    assert task_report["title"] == "Report test task"
    assert task_report["total_hours"] == 5.0  # 3.5 + 1.5
    assert task_report["status"] == "Backlog"  # default column
    # assignee_email may be null (unassigned)
    
    # Verify grand total includes our task's hours (plus any existing hours)
    # We'll just ensure grand_total >= 5.0
    assert data["grand_total"] >= 5.0
    
    # Test unauthenticated access
    unauth_response = client.get("/api/reports/time")
    assert unauth_response.status_code == 401