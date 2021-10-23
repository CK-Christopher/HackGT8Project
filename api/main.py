from flask import Flask
import importlib
import os
from .conf import defaults
from .endpoints.internal import internal

if 'HACK_ENV' in os.environ:
    conf = importlib.import_module('.conf.{}'.format(os.environ['HACK_ENV']), package='api')
else:
    conf = importlib.import_module('.conf.defaults', package='api')

app = Flask('Hackgt')
app.config.from_object(defaults)
app.config.from_object(conf)

app.register_blueprint(internal)

app.run(port=app.config['APP_PORT'])
