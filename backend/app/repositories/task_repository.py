from typing import Optional, List, Tuple

from sqlalchemy.orm import Session

from app.models.task import Task, TaskHistory, TaskStatus, TaskPriority, ActionType


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, task_id: int) -> Optional[Task]:
        return self.db.query(Task).filter(Task.id == task_id).first()

    def get_project_tasks(
        self,
        project_id: int,
        status: Optional[TaskStatus] = None,
        page: int = 1,
        size: int = 10
    ) -> Tuple[List[Task], int]:
        query = self.db.query(Task).filter(Task.project_id == project_id)
        
        if status:
            query = query.filter(Task.status == status)
        
        total = query.count()
        tasks = query.offset((page - 1) * size).limit(size).all()
        return tasks, total

    def create(
        self,
        title: str,
        project_id: int,
        description: Optional[str] = None,
        priority: TaskPriority = TaskPriority.MEDIUM,
        assigned_to: Optional[int] = None
    ) -> Task:
        task = Task(
            title=title,
            description=description,
            priority=priority,
            project_id=project_id,
            assigned_to=assigned_to
        )
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        return task

    def update(self, task: Task, **kwargs) -> Task:
        for key, value in kwargs.items():
            if value is not None:
                setattr(task, key, value)
        self.db.commit()
        self.db.refresh(task)
        return task

    def delete(self, task: Task) -> None:
        self.db.delete(task)
        self.db.commit()


class TaskHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_task_history(self, task_id: int) -> List[TaskHistory]:
        return self.db.query(TaskHistory).filter(
            TaskHistory.task_id == task_id
        ).order_by(TaskHistory.changed_at.desc()).all()

    def create(
        self,
        task_id: int,
        action_type: ActionType,
        changed_by: int,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None
    ) -> TaskHistory:
        history = TaskHistory(
            task_id=task_id,
            action_type=action_type,
            old_value=old_value,
            new_value=new_value,
            changed_by=changed_by
        )
        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)
        return history
