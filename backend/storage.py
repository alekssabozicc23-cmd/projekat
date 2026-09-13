import os
import logging
from pymongo import MongoClient
import gridfs

logger = logging.getLogger(__name__)

APP_NAME = "andri-tim"

MIME_TYPES = {
    "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
    "gif": "image/gif", "webp": "image/webp", "pdf": "application/pdf",
}

_sync_client = None
_fs = None


def init_storage(force: bool = False):
    """Inicijalizuje GridFS skladište unutar iste MongoDB baze koju
    aplikacija već koristi. Ne zahteva nikakav dodatni spoljni servis."""
    global _sync_client, _fs
    if _fs is not None and not force:
        return _fs
    _sync_client = MongoClient(os.environ["MONGO_URL"])
    db = _sync_client[os.environ["DB_NAME"]]
    _fs = gridfs.GridFS(db, collection="files")
    return _fs


def put_object(path: str, data: bytes, content_type: str) -> dict:
    fs = init_storage()
    # Ukloni prethodnu verziju fajla na istoj putanji (da "zameni sliku" radi ispravno)
    for existing in fs.find({"filename": path}):
        fs.delete(existing._id)
    fs.put(data, filename=path, content_type=content_type)
    return {"path": path, "size": len(data)}


def get_object(path: str):
    fs = init_storage()
    grid_out = fs.find_one({"filename": path})
    if grid_out is None:
        raise FileNotFoundError(path)
    data = grid_out.read()
    ctype = grid_out.content_type or "application/octet-stream"
    return data, ctype
