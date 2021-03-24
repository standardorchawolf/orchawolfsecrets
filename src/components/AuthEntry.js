import React from 'react';
import { totp } from '../lib/otp';
import CountdownPie from './CountdownPie';
import AuthMenu from './AuthMenu';

export default class AuthEntry extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      token: ''
    };

    this.updateToken();
  }

  getTimeLeft() {
    const seconds = new Date().getSeconds();
    return seconds > 29 ? 60 - seconds : 30 - seconds;
  }

  updateToken = async () => {
    const secret = this.props.entry['secondFactor']['secret'];
    const shouldContinue = this.props.entry['secondFactor']['isTrue2FA'];
    if (!secret || !shouldContinue) return;//In the event of undefined we return
    const token = await totp.gen(secret);

    const timeLeft = this.getTimeLeft();
    this.setState({
      token
    });

    this.timer = setTimeout(this.updateToken, timeLeft * 1000);
  };

  UNSAFE_componentWillReceiveProps(nextProps) {
    // If the secret changed make sure to recalculate token
    if (nextProps.entry.secret !== this.props.entry.secret) {
      clearTimeout(this.timer);
      this.timer = setTimeout(this.updateToken, 0);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  handleInputChange = event => {
    const target = event.target;
    const name = target.name;

    this.props.onEntryChange({
      id: this.props.id,
      name,
      value: target.value
    });
  };

  copyToken = event => {
    const textField = document.createElement('textarea');
    textField.innerText = this.state.token;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
    this.props.onCopyToken();
  };

  render() {
    const { service, account, notes } = this.props.entry;
    const { id, onEdit, onRemove } = this.props;
    const { token } = this.state;
    const timeLeft = this.getTimeLeft();

    return (
      <div className="sk-notification sk-base">
        <div className="auth-entry">
          <div className="auth-details">
            <div className="auth-info">
              <div className="auth-service">{service}</div>
              <div className="auth-account">{account}</div>
            </div>
            <div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
          <div className="auth-options">
            <AuthMenu
              onEdit={onEdit.bind(this, id)}
              onRemove={onRemove.bind(this, id)}
            />
          </div>
        </div>
        {notes && (
          <div className="auth-notes-row">
            <div className="auth-notes">{notes}</div>
          </div>
        )}
      </div>
    );
  }
}
