import datetime
from pydantic import BaseModel, ConfigDict
from typing import Optional

class TaskUpdate(BaseModel):
    due_date: Optional[datetime.datetime] = None

try:
    print(TaskUpdate(due_date="2026-04-27T18:30:00.000Z").model_dump(exclude_unset=True))
    print("Success")
except Exception as e:
    print("Error:", e)
