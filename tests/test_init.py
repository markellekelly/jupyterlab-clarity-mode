from clarity.__init__ import _jupyter_server_extension_paths, load_jupyter_server_extension
from clarity.app import Clarity

def test_jupyter_server_extension_paths():
  temp = _jupyter_server_extension_paths()
  assert temp == [{"module": "clarity"}]

def test_load_jupyter_server_extension():
  assert load_jupyter_server_extension == Clarity.load_jupyter_server_extension