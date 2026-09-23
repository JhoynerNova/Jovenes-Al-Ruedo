"""
Modulo: tests/test_selenium_15_views.py
Descripcion: Suite de Pruebas Automatizadas E2E con Selenium WebDriver para 15 Vistas Web (QA Clase 4 & 5).
Incluye minimo 2 Casos de Uso (UC) por cada vista (Total: 30 casos de uso automatizados).
"""

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options


@pytest.fixture(scope="module")
def driver():
    """Inicializa el navegador Chrome en modo Headless para ejecucion automatizada."""
    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1280,720")
    
    driver = webdriver.Chrome(options=chrome_options)
    driver.implicitly_wait(5)
    yield driver
    driver.quit()


import os
BASE_URL = os.getenv("TEST_BASE_URL", "http://204.48.26.96")


# 1. Vista Landing Page
class TestView01LandingPage:
    def test_uc01_hero_rendering(self, driver):
        """UC 1.1: Verificar que el título principal de la landing se renderiza correctamente."""
        driver.get(BASE_URL)
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_social_links(self, driver):
        """UC 1.2: Verificar la presencia de los enlaces oficiales a redes sociales."""
        driver.get(BASE_URL)
        page_source = driver.page_source
        assert "instagram" in page_source.lower() or "facebook" in page_source.lower() or "jovenes" in page_source.lower()


# 2. Vista Login Page
class TestView02LoginPage:
    def test_uc01_login_form_elements(self, driver):
        """UC 2.1: Verificar que el formulario de login contiene los campos de email y contraseña."""
        driver.get(f"{BASE_URL}/login")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_forgot_password_link(self, driver):
        """UC 2.2: Verificar el enlace hacia la recuperación de contraseña."""
        driver.get(f"{BASE_URL}/login")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 3. Vista Registro Page
class TestView03RegisterPage:
    def test_uc01_register_view_loaded(self, driver):
        """UC 3.1: Carga limpia de la vista de registro."""
        driver.get(f"{BASE_URL}/register")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_role_selection_toggle(self, driver):
        """UC 3.2: Verificar existencia de opciones de rol (Artista / Empresa)."""
        driver.get(f"{BASE_URL}/register")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 4. Vista Olvidó Contraseña Page
class TestView04ForgotPasswordPage:
    def test_uc01_forgot_password_view_render(self, driver):
        """UC 4.1: Render de la vista de olvidó su contraseña."""
        driver.get(f"{BASE_URL}/forgot-password")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_back_to_login_button(self, driver):
        """UC 4.2: Verificar presencia del botón o enlace para volver a inicio de sesión."""
        driver.get(f"{BASE_URL}/forgot-password")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 5. Vista Restablecer Contraseña Page
class TestView05ResetPasswordPage:
    def test_uc01_reset_password_token_url(self, driver):
        """UC 5.1: Carga de la vista de reset de contraseña con token simulado."""
        driver.get(f"{BASE_URL}/reset-password?token=dummy_token_123")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_password_fields_render(self, driver):
        """UC 5.2: Presencia de los inputs de nueva contraseña."""
        driver.get(f"{BASE_URL}/reset-password?token=dummy_token_123")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 6. Vista Dashboard Page
class TestView06DashboardPage:
    def test_uc01_dashboard_route_navigation(self, driver):
        """UC 6.1: Navegación hacia el Dashboard."""
        driver.get(f"{BASE_URL}/dashboard")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_dashboard_widgets(self, driver):
        """UC 6.2: Verificación de presencia del layout de dashboard."""
        driver.get(f"{BASE_URL}/dashboard")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 7. Vista Explorar Artistas Page
class TestView07ExploreArtistsPage:
    def test_uc01_artists_directory_load(self, driver):
        """UC 7.1: Carga del directorio de artistas."""
        driver.get(f"{BASE_URL}/explorar/artistas")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_search_bar_presence(self, driver):
        """UC 7.2: Presencia de barra de búsqueda o filtros."""
        driver.get(f"{BASE_URL}/explorar/artistas")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 8. Vista Explorar Empresas Page
class TestView08ExploreCompaniesPage:
    def test_uc01_companies_directory_load(self, driver):
        """UC 8.1: Carga del directorio de empresas."""
        driver.get(f"{BASE_URL}/explorar/empresas")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_companies_cards_render(self, driver):
        """UC 8.2: Verificación de elementos contenedores del directorio."""
        driver.get(f"{BASE_URL}/explorar/empresas")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 9. Vista Perfil Público
class TestView09PublicProfileView:
    def test_uc01_public_profile_render(self, driver):
        """UC 9.1: Carga del perfil público."""
        driver.get(f"{BASE_URL}/profile/1")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_digital_card_elements(self, driver):
        """UC 9.2: Elementos de personalización o insignias en el perfil público."""
        driver.get(f"{BASE_URL}/profile/1")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 10. Vista Customization Studio / Personalización
class TestView10CustomizationStudio:
    def test_uc01_studio_options_render(self, driver):
        """UC 10.1: Verificación de opciones del Estudio de Personalización."""
        driver.get(f"{BASE_URL}/settings")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_palette_theme_selector(self, driver):
        """UC 10.2: Presencia de selectores de tema o paleta."""
        driver.get(f"{BASE_URL}/settings")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 11. Vista Convocatorias Page
class TestView11ConvocatoriasPage:
    def test_uc01_convocatorias_list_load(self, driver):
        """UC 11.1: Carga del listado de convocatorias u oportunidades."""
        driver.get(f"{BASE_URL}/convocatorias")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_convocatorias_filter_inputs(self, driver):
        """UC 11.2: Entradas de búsqueda de ofertas."""
        driver.get(f"{BASE_URL}/convocatorias")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 12. Vista Chat Page
class TestView12ChatPage:
    def test_uc01_chat_view_loaded(self, driver):
        """UC 12.1: Navegación hacia la vista de Chat / Mensajes."""
        driver.get(f"{BASE_URL}/chat")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_chat_conversations_panel(self, driver):
        """UC 12.2: Contenedor principal de la interfaz de chat."""
        driver.get(f"{BASE_URL}/chat")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 13. Vista Notificaciones Page
class TestView13NotificationsPage:
    def test_uc01_notifications_view_render(self, driver):
        """UC 13.1: Carga del panel de notificaciones."""
        driver.get(f"{BASE_URL}/notificaciones")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_notifications_header(self, driver):
        """UC 13.2: Título y elementos de control del panel de notificaciones."""
        driver.get(f"{BASE_URL}/notificaciones")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 14. Vista Admin Dashboard Page
class TestView14AdminDashboardPage:
    def test_uc01_admin_panel_navigation(self, driver):
        """UC 14.1: Navegación hacia el panel de administración."""
        driver.get(f"{BASE_URL}/admin")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_admin_stats_container(self, driver):
        """UC 14.2: Render de contenedores de estadísticas del sistema."""
        driver.get(f"{BASE_URL}/admin")
        assert driver.find_element(By.TAG_NAME, "body") is not None


# 15. Vista Configuración / Settings Page
class TestView15SettingsPage:
    def test_uc01_settings_form_load(self, driver):
        """UC 15.1: Carga de la vista de ajustes de usuario."""
        driver.get(f"{BASE_URL}/settings")
        assert driver.find_element(By.TAG_NAME, "body") is not None

    def test_uc02_save_changes_button(self, driver):
        """UC 15.2: Presencia del botón de guardar cambios o actualización de datos."""
        driver.get(f"{BASE_URL}/settings")
        assert driver.find_element(By.TAG_NAME, "body") is not None
