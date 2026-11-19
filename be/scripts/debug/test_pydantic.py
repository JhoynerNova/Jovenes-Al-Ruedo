import uuid
from pydantic import BaseModel, ConfigDict

class MensajeResponse(BaseModel):
    remitente_id: str
    model_config = ConfigDict(from_attributes=True)

class MensajeORM:
    def __init__(self):
        self.remitente_id = uuid.uuid4()

try:
    obj = MensajeORM()
    res = MensajeResponse.model_validate(obj)
    print("Success:", res)
except Exception as e:
    print("Error:", e)
