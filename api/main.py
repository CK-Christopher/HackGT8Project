from flask import Flask
import importlib
import os
from .conf import defaults
from .endpoints.internal import internal
from .endpoints.auth import auth
from .endpoints.business import business
from .endpoints.invoices import invoices
from .endpoints.rewards import rewards

if 'HACK_ENV' in os.environ:
    conf = importlib.import_module('.conf.{}'.format(os.environ['HACK_ENV']), package='api')
else:
    conf = importlib.import_module('.conf.defaults', package='api')

app = Flask('Hackgt')
app.config.from_object(defaults)
app.config.from_object(conf)

app.register_blueprint(internal)
app.register_blueprint(auth)
app.register_blueprint(business)
app.register_blueprint(invoices)
app.register_blueprint(rewards)

app.run(port=app.config['APP_PORT'])
