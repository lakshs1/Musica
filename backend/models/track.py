from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, TimestampMixin


class Track(Base, TimestampMixin):
    __tablename__ = "tracks"
    __table_args__ = (Index("ix_tracks_youtube_id", "youtube_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    youtube_id: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    thumbnail: Mapped[str] = mapped_column(String(1024), nullable=False)
    duration: Mapped[str] = mapped_column(String(20), nullable=False)
