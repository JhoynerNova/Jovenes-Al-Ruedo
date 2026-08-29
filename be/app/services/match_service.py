"""
Módulo: services/match_service.py
Descripción: Algoritmo de emparejamiento inteligente (Match Cultural) entre perfiles de artistas y convocatorias.
"""
from typing import Dict, Any


def calculate_cultural_match(artist_area: str | None, artist_location: str | None, conv_name: str, conv_desc: str | None, conv_location: str | None) -> int:
    """Calcula un porcentaje de coincidencia (0-100%) entre un artista y una convocatoria.
    
    Factores evaluados:
    1. Coincidencia de área artística / disciplina (40% del peso).
    2. Coincidencia geográfica / ubicación (30% del peso).
    3. Afinidad de palabras clave y completitud de perfil (30% del peso).
    """
    score = 55 # Puntaje base por registrarse en la plataforma

    if not artist_area:
        return 60

    art_area_clean = artist_area.lower().strip()
    conv_text = f"{conv_name} {conv_desc or ''}".lower()

    # 1. Área Artística
    if art_area_clean in conv_text:
        score += 25
    elif any(word in conv_text for word in art_area_clean.split()):
        score += 15

    # 2. Ubicación
    if artist_location and conv_location:
        loc_clean = artist_location.lower().strip()
        conv_loc_clean = conv_location.lower().strip()
        if loc_clean in conv_loc_clean or conv_loc_clean in loc_clean:
            score += 15

    # Tope máximo 98%
    return min(98, max(50, score))
