from pydantic import BaseModel


class TrackResponse(BaseModel):
    id: int
    youtube_id: str
    title: str
    thumbnail: str
    duration: str

    model_config = {"from_attributes": True}
