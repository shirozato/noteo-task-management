from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import auth, user, task, habit, sleep, water, analytics

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(user.router)
app.include_router(task.router)
app.include_router(habit.router)
app.include_router(sleep.router)
app.include_router(water.router)
app.include_router(analytics.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
