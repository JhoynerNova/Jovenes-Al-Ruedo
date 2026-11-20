"""
Módulo: tests/test_auth.py
Descripción: Tests de integración para todos los endpoints de autenticación y usuario.
"""

from fastapi.testclient import TestClient

from app.tests.conftest import (
    TEST_USER_EMAIL,
    TEST_USER_FULL_NAME,
    TEST_USER_PASSWORD,
)

# ════════════════════════════════════════════════════════════
# 📝 TESTS DE REGISTRO — POST /api/v1/auth/register
# ════════════════════════════════════════════════════════════

class TestRegister:
    """Tests para el endpoint de registro de usuarios.
    """

    URL = "/api/v1/auth/register"

    def test_register_success(self, client: TestClient) -> None:
        """Registro exitoso con datos válidos → 201 + datos del usuario sin password.
        """
        response = client.post(
            self.URL,
            json={
                "email": "new@nn-company.com",
                "first_name": "New",
                "last_name": "User",
                "birth_date": "2003-01-01",
                "artistic_area": "Danza",
                "password": "NewPass123",
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "new@nn-company.com"
        assert data["full_name"] == "NEW USER"
        assert data["is_active"] is True
        assert "hashed_password" not in data
        assert "password" not in data
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_register_duplicate_email(
        self, client: TestClient, test_user: object
    ) -> None:
        """Registro con email duplicado → 400.
        """
        response = client.post(
            self.URL,
            json={
                "email": TEST_USER_EMAIL,
                "first_name": "Duplicate",
                "last_name": "User",
                "birth_date": "2003-01-01",
                "artistic_area": "Teatro",
                "password": "TestPass123",
            },
        )
        

        assert response.status_code == 400
        assert "ya está registrado" in response.json()["detail"]

    def test_register_weak_password_too_short(self, client: TestClient) -> None:
        """Registro con contraseña muy corta → 422.
        """
        response = client.post(
            self.URL,
            json={
                "email": "weak@nn-company.com",
                "first_name": "Weak",
                "last_name": "User",
                "password": "Ab1",
            },
        )

        assert response.status_code == 422

    def test_register_password_no_uppercase(self, client: TestClient) -> None:
        """Registro con contraseña sin mayúsculas → 422."""
        response = client.post(
            self.URL,
            json={
                "email": "weak@nn-company.com",
                "first_name": "Weak",
                "last_name": "User",
                "password": "testpass123",
            },
        )

        assert response.status_code == 422

    def test_register_password_no_lowercase(self, client: TestClient) -> None:
        """Registro con contraseña sin minúsculas → 422."""
        response = client.post(
            self.URL,
            json={
                "email": "weak@nn-company.com",
                "first_name": "Weak",
                "last_name": "User",
                "password": "TESTPASS123",
            },
        )

        assert response.status_code == 422

    def test_register_password_no_digit(self, client: TestClient) -> None:
        """Registro con contraseña sin números → 422."""
        response = client.post(
            self.URL,
            json={
                "email": "weak@nn-company.com",
                "first_name": "Weak",
                "last_name": "User",
                "password": "TestPassword",
            },
        )

        assert response.status_code == 422

    def test_register_invalid_email(self, client: TestClient) -> None:
        """Registro con email inválido → 422.
        """
        response = client.post(
            self.URL,
            json={
                "email": "not-an-email",
                "first_name": "Bad",
                "last_name": "Email",
                "password": "TestPass123",
            },
        )

        assert response.status_code == 422

    def test_register_empty_name(self, client: TestClient) -> None:
        """Registro con nombre vacío → 422."""
        response = client.post(
            self.URL,
            json={
                "email": "empty@nn-company.com",
                "first_name": " ",
                "last_name": " ",
                "password": "TestPass123",
            },
        )

        assert response.status_code == 422

    def test_register_missing_fields(self, client: TestClient) -> None:
        """Registro sin campos requeridos → 422.
        """
        response = client.post(
            self.URL,
            json={
                "email": "partial@nn-company.com",
                "first_name": "Partial",
                "last_name": "User",
            },
        )

        assert response.status_code == 422

# ════════════════════════════════════════════════════════════
# 🔑 TESTS DE LOGIN — POST /api/v1/auth/login
# ════════════════════════════════════════════════════════════

class TestLogin:
    """Tests para el endpoint de inicio de sesión.
    """

    URL = "/api/v1/auth/login"

    def test_login_success(self, client: TestClient, test_user: object) -> None:
        """Login exitoso → 200 + tokens JWT.
        """
        response = client.post(
            self.URL,
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0
        assert len(data["refresh_token"]) > 0

    def test_login_wrong_password(
        self, client: TestClient, test_user: object
    ) -> None:
        """Login con contraseña incorrecta → 401.
        """
        response = client.post(
            self.URL,
            json={
                "email": TEST_USER_EMAIL,
                "password": "WrongPassword123",
            },
        )

        assert response.status_code == 401
        assert "inválidas" in response.json()["detail"]

    def test_login_nonexistent_email(self, client: TestClient) -> None:
        """Login con email que no existe → 401.
        """
        response = client.post(
            self.URL,
            json={
                "email": "ghost@nn-company.com",
                "password": "TestPass123",
            },
        )

        assert response.status_code == 401
        assert "inválidas" in response.json()["detail"]

    def test_login_inactive_user(self, client: TestClient, test_user: object, db: object) -> None:
        """Login con usuario desactivado → 403.
        """
        from app.models.user import User

        test_user.is_active = False  # type: ignore[attr-defined]
        db.commit()  # type: ignore[attr-defined]

        response = client.post(
            self.URL,
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
            },
        )

        assert response.status_code == 403
        assert "desactivada" in response.json()["detail"].lower()

# ════════════════════════════════════════════════════════════
# 🔄 TESTS DE REFRESH — POST /api/v1/auth/refresh
# ════════════════════════════════════════════════════════════

class TestRefresh:
    """Tests para el endpoint de renovación de tokens.
    """

    URL = "/api/v1/auth/refresh"

    def test_refresh_success(self, client: TestClient, test_user: object) -> None:
        """Refresh con token válido → 200 + nuevos tokens.
        """
        # Primero hacer login para obtener refresh token
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
            },
        )
        refresh_token = login_response.json()["refresh_token"]

        # Usar el refresh token
        response = client.post(
            self.URL,
            json={"refresh_token": refresh_token},
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_refresh_invalid_token(self, client: TestClient) -> None:
        """Refresh con token inválido → 401.
        """
        response = client.post(
            self.URL,
            json={"refresh_token": "token.invalido.falso"},
        )

        assert response.status_code == 401

    def test_refresh_with_access_token(
        self, client: TestClient, test_user: object
    ) -> None:
        """Refresh usando un access token (en vez de refresh) → 401.
        """
        # Obtener access token vía login
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
            },
        )
        access_token = login_response.json()["access_token"]

        # Intentar usar access token como refresh
        response = client.post(
            self.URL,
            json={"refresh_token": access_token},
        )

        assert response.status_code == 401

# ════════════════════════════════════════════════════════════
# 🔒 TESTS DE CAMBIO DE CONTRASEÑA — POST /api/v1/auth/change-password
# ════════════════════════════════════════════════════════════

class TestChangePassword:
    """Tests para el endpoint de cambio de contraseña (usuario autenticado).
    """

    URL = "/api/v1/auth/change-password"

    def test_change_password_success(
        self, client: TestClient, auth_headers: dict[str, str]
    ) -> None:
        """Cambio exitoso → 200 + login funciona con nueva contraseña.
        """
        new_password = "NewSecure456"

        response = client.post(
            self.URL,
            json={
                "current_password": TEST_USER_PASSWORD,
                "new_password": new_password,
            },
            headers=auth_headers,
        )

        assert response.status_code == 200
        assert "actualizada" in response.json()["message"].lower()

        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": new_password,
            },
        )
        assert login_response.status_code == 200

    def test_change_password_wrong_current(
        self, client: TestClient, auth_headers: dict[str, str]
    ) -> None:
        """Cambio con contraseña actual incorrecta → 400.
        """
        response = client.post(
            self.URL,
            json={
                "current_password": "WrongCurrent123",
                "new_password": "NewPass456",
            },
            headers=auth_headers,
        )

        assert response.status_code == 400
        assert "incorrecta" in response.json()["detail"].lower()

    def test_change_password_no_auth(self, client: TestClient) -> None:
        """Cambio sin autenticación → 401.
        """
        response = client.post(
            self.URL,
            json={
                "current_password": TEST_USER_PASSWORD,
                "new_password": "NewPass456",
            },
        )

        assert response.status_code == 401

    def test_change_password_weak_new_password(
        self, client: TestClient, auth_headers: dict[str, str]
    ) -> None:
        """Cambio con nueva contraseña débil → 422.
        """
        response = client.post(
            self.URL,
            json={
                "current_password": TEST_USER_PASSWORD,
                "new_password": "weak",
            },
            headers=auth_headers,
        )

        assert response.status_code == 422

# ════════════════════════════════════════════════════════════
# 📧 TESTS DE FORGOT PASSWORD — POST /api/v1/auth/forgot-password
# ════════════════════════════════════════════════════════════

class TestForgotPassword:
    """Tests para el endpoint de solicitud de recuperación de contraseña.
    """

    URL = "/api/v1/auth/forgot-password"

    def test_forgot_password_existing_email(
        self, client: TestClient, test_user: object
    ) -> None:
        """Forgot con email existente → 200 + mensaje genérico.
        """
        response = client.post(
            self.URL,
            json={"email": TEST_USER_EMAIL},
        )

        assert response.status_code == 200
        assert "enlace de recuperación" in response.json()["message"].lower()

    def test_forgot_password_nonexistent_email(self, client: TestClient) -> None:
        """Forgot con email no registrado → 200 + MISMO mensaje genérico.

                  determinar qué emails están registrados (enumeración de usuarios).
        """
        response = client.post(
            self.URL,
            json={"email": "ghost@nn-company.com"},
        )

        assert response.status_code == 200
        assert "enlace de recuperación" in response.json()["message"].lower()

    def test_forgot_password_invalid_email(self, client: TestClient) -> None:
        """Forgot con email inválido → 422."""
        response = client.post(
            self.URL,
            json={"email": "not-an-email"},
        )

        assert response.status_code == 422

# ════════════════════════════════════════════════════════════
# 🔓 TESTS DE RESET PASSWORD — POST /api/v1/auth/reset-password
# ════════════════════════════════════════════════════════════

class TestResetPassword:
    """Tests para el endpoint de restablecimiento de contraseña.
    """

    URL = "/api/v1/auth/reset-password"

    def test_reset_password_success(
        self, client: TestClient, valid_reset_token: str
    ) -> None:
        """Reset exitoso → 200 + login funciona con nueva contraseña.
        """
        new_password = "ResetPass789"

        response = client.post(
            self.URL,
            json={
                "token": valid_reset_token,
                "new_password": new_password,
            },
        )

        assert response.status_code == 200
        assert "restablecida" in response.json()["message"].lower()

        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "email": TEST_USER_EMAIL,
                "password": new_password,
            },
        )
        assert login_response.status_code == 200

    def test_reset_password_invalid_token(self, client: TestClient) -> None:
        """Reset con token inexistente → 400.
        """
        response = client.post(
            self.URL,
            json={
                "token": "00000000-0000-0000-0000-000000000000",
                "new_password": "NewPass456",
            },
        )

        assert response.status_code == 400
        assert "inválido" in response.json()["detail"].lower()

    def test_reset_password_expired_token(
        self, client: TestClient, expired_reset_token: str
    ) -> None:
        """Reset con token expirado → 400.
        """
        response = client.post(
            self.URL,
            json={
                "token": expired_reset_token,
                "new_password": "NewPass456",
            },
        )

        assert response.status_code == 400
        assert "expirado" in response.json()["detail"].lower()

    def test_reset_password_used_token(
        self, client: TestClient, used_reset_token: str
    ) -> None:
        """Reset con token ya utilizado → 400.
        """
        response = client.post(
            self.URL,
            json={
                "token": used_reset_token,
                "new_password": "NewPass456",
            },
        )

        assert response.status_code == 400
        assert "utilizado" in response.json()["detail"].lower()

    def test_reset_password_weak_new_password(
        self, client: TestClient, valid_reset_token: str
    ) -> None:
        """Reset con nueva contraseña débil → 422."""
        response = client.post(
            self.URL,
            json={
                "token": valid_reset_token,
                "new_password": "123",
            },
        )

        assert response.status_code == 422

# ════════════════════════════════════════════════════════════
# 👤 TESTS DE PERFIL — GET /api/v1/users/me
# ════════════════════════════════════════════════════════════

class TestGetMe:
    """Tests para el endpoint de perfil de usuario.
    """

    URL = "/api/v1/users/me"

    def test_get_me_success(
        self, client: TestClient, auth_headers: dict[str, str], test_user: object
    ) -> None:
        """GET /me con token válido → 200 + datos del usuario.
        """
        response = client.get(self.URL, headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER_EMAIL
        assert data["full_name"] == TEST_USER_FULL_NAME
        assert data["is_active"] is True
        assert "hashed_password" not in data
        assert "password" not in data

    def test_get_me_no_auth(self, client: TestClient) -> None:
        """GET /me sin token → 401.
        """
        response = client.get(self.URL)

        assert response.status_code == 401

    def test_get_me_invalid_token(self, client: TestClient) -> None:
        """GET /me con token inválido → 401."""
        response = client.get(
            self.URL,
            headers={"Authorization": "Bearer token.invalido.falso"},
        )

        assert response.status_code == 401

# ════════════════════════════════════════════════════════════
# ❤️ TESTS DE HEALTH CHECK — GET /api/v1/health
# ════════════════════════════════════════════════════════════

class TestHealthCheck:
    """Tests para el endpoint de verificación de salud del servidor.
    """

    URL = "/api/v1/health"

    def test_health_check(self, client: TestClient) -> None:
        """Health check → 200 + status healthy."""
        response = client.get(self.URL)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["project"] == "Jóvenes al Ruedo"
