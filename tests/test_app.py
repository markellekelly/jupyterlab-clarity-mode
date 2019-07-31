from clarity.app import Clarity
from tornado.testing import *
from clarity.handler import MyExtHandler
import jinja2

class TestClarityWebApp(AsyncHTTPTestCase):
    def get_app(self):
        serverapp = Clarity.initialize_server()
        cl=Clarity()
        cl.initialize(serverapp)
        return cl.serverapp.web_app

    def test_homepage(self):
        response = self.fetch('/')
        self.assertEqual(response.code, 200)
    
    def test_not_found(self):
        response = self.fetch('/not_valid.url')
        self.assertEqual(response.code, 404)

def test_initialize_templates():
    cl = Clarity()
    cl.initialize_templates()
    env = cl.settings['clarity_jinja2_env']
    assert type(env) == jinja2.Environment
    assert env.loader.searchpath[0] == os.path.join(os.path.split(os.path.dirname(__file__))[0],'clarity','templates')
    assert len(env.loader.searchpath) == 1

def test_initialize_handlers():
    cl = Clarity()
    cl.initialize_handlers()
    assert (r'/clarity/?', MyExtHandler) in cl.handlers
