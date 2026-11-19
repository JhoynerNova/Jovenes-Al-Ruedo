with open(r"c:\Users\jhoyn\Desktop\Proyecto del sena\Jovenes Al Ruedo\fe\src\pages\LandingPage.tsx", "r", encoding="utf-8") as f:
    for i, line in enumerate(f):
        if "postular" in line.lower() or "convocatoria" in line.lower() or "explore" in line.lower():
            print(f"Line {i+1}: {line.strip()}")
