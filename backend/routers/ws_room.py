import random
import string
import time
import json
import logging
from typing import Dict, List, Set, Any
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger("ws_room")
router = APIRouter(prefix="/rooms", tags=["rooms"])

class Room:
    def __init__(self, code: str):
        self.code = code
        self.connections: Set[WebSocket] = set()
        self.active_track: Dict[str, Any] | None = None
        self.is_playing: bool = False
        self.position: float = 0.0  # in seconds
        self.last_updated_time: float = time.time()
        self.queue: List[Dict[str, Any]] = []

    def get_current_position(self) -> float:
        if self.is_playing and self.active_track:
            elapsed = time.time() - self.last_updated_time
            return self.position + elapsed
        return self.position

    def update_playback(self, is_playing: bool, position: float, track: Dict[str, Any] | None = None):
        if track is not None:
            self.active_track = track
        self.is_playing = is_playing
        self.position = position
        self.last_updated_time = time.time()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "room_code": self.code,
            "active_track": self.active_track,
            "is_playing": self.is_playing,
            "position": self.get_current_position(),
            "queue": self.queue,
            "member_count": len(self.connections)
        }

# Global in-memory rooms store
active_rooms: Dict[str, Room] = {}

def generate_room_code() -> str:
    # 6 letter random uppercase string
    while True:
        code = "".join(random.choices(string.ascii_uppercase, k=6))
        if code not in active_rooms:
            return code

@router.get("/create")
async def create_room():
    code = generate_room_code()
    active_rooms[code] = Room(code)
    logger.info(f"Created room {code}")
    return {"room_code": code}

@router.get("/verify/{room_code}")
async def verify_room(room_code: str):
    code = room_code.upper()
    exists = code in active_rooms
    return {"room_code": code, "exists": exists}

async def broadcast_to_room(room: Room):
    state_payload = {
        "type": "sync",
        "state": room.to_dict()
    }
    message_str = json.dumps(state_payload)
    disconnected = set()
    for connection in list(room.connections):
        try:
            await connection.send_text(message_str)
        except Exception:
            disconnected.add(connection)
            
    for conn in disconnected:
        if conn in room.connections:
            room.connections.remove(conn)

@router.websocket("/ws/{room_code}")
async def websocket_endpoint(websocket: WebSocket, room_code: str):
    code = room_code.upper()
    await websocket.accept()
    
    if code not in active_rooms:
        active_rooms[code] = Room(code)
        
    room = active_rooms[code]
    room.connections.add(websocket)
    
    logger.info(f"Client connected to room {code}. Total connections: {len(room.connections)}")
    
    # Broadcast join event / sync immediately
    await broadcast_to_room(room)
    
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            msg_type = payload.get("type")
            
            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                continue
                
            elif msg_type == "play":
                track = payload.get("track")
                pos = float(payload.get("position", 0.0))
                room.update_playback(is_playing=True, position=pos, track=track)
                await broadcast_to_room(room)
                
            elif msg_type == "pause":
                pos = float(payload.get("position", 0.0))
                room.update_playback(is_playing=False, position=pos)
                await broadcast_to_room(room)
                
            elif msg_type == "seek":
                pos = float(payload.get("position", 0.0))
                room.update_playback(is_playing=room.is_playing, position=pos)
                await broadcast_to_room(room)
                
            elif msg_type == "queue_add":
                track = payload.get("track")
                if track and track not in room.queue:
                    room.queue.append(track)
                    await broadcast_to_room(room)
                    
            elif msg_type == "queue_remove":
                youtube_id = payload.get("youtube_id")
                room.queue = [t for t in room.queue if t.get("youtube_id") != youtube_id]
                await broadcast_to_room(room)
                
            elif msg_type == "queue_play":
                index = int(payload.get("index", 0))
                if 0 <= index < len(room.queue):
                    next_track = room.queue.pop(index)
                    room.update_playback(is_playing=True, position=0.0, track=next_track)
                    await broadcast_to_room(room)
                    
            elif msg_type == "request_sync":
                await websocket.send_text(json.dumps({
                    "type": "sync",
                    "state": room.to_dict()
                }))
                
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from room {code}")
    except Exception as e:
        logger.error(f"WebSocket error in room {code}: {e}")
    finally:
        if websocket in room.connections:
            room.connections.remove(websocket)
        # If room becomes empty, we can clean it up after a while, or keep it.
        # Let's broadcast the new connection count to remaining users.
        await broadcast_to_room(room)
