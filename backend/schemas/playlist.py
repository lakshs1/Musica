from pydantic import BaseModel

from schemas.track import TrackResponse


class CreatePlaylistRequest(BaseModel):
    name: str
    description: str | None = None


class AddTrackRequest(BaseModel):
    track_id: int
    position: int | None = None


class InviteMemberRequest(BaseModel):
    email: str
    role: str = "editor"


class PlaylistMemberResponse(BaseModel):
    id: int
    email: str
    role: str


class PlaylistTrackResponse(BaseModel):
    id: int
    position: int
    track: TrackResponse


class PlaylistResponse(BaseModel):
    id: int
    name: str
    description: str | None
    owner_id: int
    tracks: list[PlaylistTrackResponse]
    members: list[PlaylistMemberResponse]
