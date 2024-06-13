import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import envConfig from './envConfig';

const mailgun = new Mailgun(FormData);

const mailgunClient = mailgun.client({
  username: 'api',
  key: envConfig.MAILGUN_API_KEY,
  url: envConfig.MAILGUN_API_URL
});

export default mailgunClient;
