import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ValidationUtil } from '../../utils/validationUtil';

function MembershipPage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressBase, setAddressBase] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [addressExtra, setAddressExtra] = useState('');

  const [nicknameMsg, setNicknameMsg] = useState('');
  const [nicknameMsgColor, setNicknameMsgColor] = useState('');
  const [isNicknameValid, setIsNicknameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  const lastCheckedNickname = useRef('');
  const checkedEmail = useRef('');
  const lastCheckedPw = useRef('');
  const lastCheckedPwForMatch = useRef('');
  const lastCheckedPwConfirm = useRef('');
  const lastCheckedPhone = useRef('');
  const addressDetailRef = useRef<HTMLInputElement>(null);

  // 닉네임 입력
  const handleNicknameInput = (value: string) => {
    const filtered = ValidationUtil.filterNickname(value);
    setNickname(filtered);

    if (!ValidationUtil.isValidNicknameLength(filtered) && filtered.length > 0) {
      setIsNicknameValid(false);
      setNicknameMsg(ValidationUtil.MSG.NICKNAME_LENGTH);
      setNicknameMsgColor('red');
    } else if (filtered !== lastCheckedNickname.current) {
      setIsNicknameValid(false);
      setNicknameMsg('');
    }
  };

  // 닉네임 blur 시 중복 확인
  const handleNicknameBlur = async () => {
    if (nickname === '' || nickname === lastCheckedNickname.current || nickname.length > 10) return;
    lastCheckedNickname.current = nickname;

    try {
      const response = await axios.get('/api/nicknameCheck', { params: { nickname } });
      if (response.data) {
        setIsNicknameValid(true);
        setNicknameMsg(ValidationUtil.MSG.NICKNAME_VALID);
        setNicknameMsgColor('green');
      } else {
        setIsNicknameValid(false);
        setNicknameMsg(ValidationUtil.MSG.NICKNAME_INVALID);
        setNicknameMsgColor('red');
      }
    } catch {
      setIsNicknameValid(false);
      setNicknameMsg(ValidationUtil.MSG.NICKNAME_INVALID);
      setNicknameMsgColor('red');
    }
  };

  // 이메일 중복확인
  const handleCheckEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (email === '') {
      alert('이메일을 입력해주세요.');
      return;
    }

    try {
      const response = await axios.get('/api/emailCheck', { params: { email } });
      if (response.data) {
        alert('사용 가능한 이메일입니다.');
        setIsEmailValid(true);
        checkedEmail.current = email;
      } else {
        alert('사용 불가능한 이메일입니다.');
        setIsEmailValid(false);
        checkedEmail.current = '';
      }
    } catch {
      alert('이메일 확인 중 오류가 발생했습니다.');
    }
  };

  // 이메일 변경 시 유효성 초기화
  const handleEmailInput = (value: string) => {
    setEmail(value);
    if (value !== checkedEmail.current) {
      setIsEmailValid(false);
    }
  };

  // 비밀번호 blur
  const handlePasswordBlur = () => {
    if (password === '' || password === lastCheckedPw.current) return;
    lastCheckedPw.current = password;

    if (ValidationUtil.isValidPassword(password)) {
      alert('사용 가능한 비밀번호입니다.');
    } else {
      alert(ValidationUtil.MSG.PASSWORD_INVALID);
    }
  };

  // 비밀번호 확인 blur
  const handlePasswordConfirmBlur = () => {
    if (passwordConfirm === '') return;
    if (password === lastCheckedPwForMatch.current && passwordConfirm === lastCheckedPwConfirm.current) return;

    lastCheckedPwForMatch.current = password;
    lastCheckedPwConfirm.current = passwordConfirm;

    if (ValidationUtil.isPasswordMatch(password, passwordConfirm)) {
      alert(ValidationUtil.MSG.PASSWORD_MATCH);
    } else {
      alert(ValidationUtil.MSG.PASSWORD_NOT_MATCH);
    }
  };

  // 휴대폰번호 자동 하이픈
  const handlePhoneInput = (value: string) => {
    let numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length > 11) {
      numbers = numbers.substring(0, 11);
    }

    let formatted = '';
    if (numbers.length <= 3) {
      formatted = numbers;
    } else if (numbers.length <= 7) {
      formatted = numbers.substring(0, 3) + '-' + numbers.substring(3);
    } else {
      if (numbers.substring(0, 2) === '02') {
        formatted = numbers.substring(0, 2) + '-' + numbers.substring(2, 6) + '-' + numbers.substring(6);
      } else {
        formatted = numbers.substring(0, 3) + '-' + numbers.substring(3, 7) + '-' + numbers.substring(7);
      }
    }
    setPhoneNumber(formatted);
  };

  // 휴대폰번호 blur
  const handlePhoneBlur = () => {
    if (phoneNumber === '' || phoneNumber === lastCheckedPhone.current) return;
    lastCheckedPhone.current = phoneNumber;

    if (ValidationUtil.isValidPhone(phoneNumber)) {
      alert(ValidationUtil.MSG.PHONE_VALID);
    } else {
      alert(ValidationUtil.MSG.PHONE_INVALID);
    }
  };

  // 주소찾기
  const handleFindAddress = (e: React.MouseEvent) => {
    e.preventDefault();
    new daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const addr = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
        let extraAddr = '';

        if (data.userSelectedType === 'R') {
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddr += data.bname;
          }
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
          }
        }

        setZipCode(data.zonecode);
        setAddressBase(addr);
        setAddressExtra(extraAddr);
        addressDetailRef.current?.focus();
      },
    }).open();
  };

  // 회원가입
  const handleRegister = async (e: React.MouseEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (nickname === '') errors.push('닉네임을 입력해주세요.');
    else if (!isNicknameValid) errors.push('사용 불가능한 닉네임입니다.');
    if (email === '') errors.push('이메일을 입력해주세요.');
    if (password === '') errors.push('비밀번호를 입력해주세요.');
    if (passwordConfirm === '') errors.push('비밀번호 확인을 입력해주세요.');
    if (phoneNumber === '') errors.push('휴대폰번호를 입력해주세요.');
    if (zipCode === '') errors.push('주소를 입력해주세요.');
    if (email !== '' && !isEmailValid) errors.push('이메일 중복확인이 필요합니다.');
    if (password !== '' && !ValidationUtil.isValidPassword(password)) errors.push(ValidationUtil.MSG.PASSWORD_INVALID);
    if (password !== '' && passwordConfirm !== '' && !ValidationUtil.isPasswordMatch(password, passwordConfirm)) errors.push(ValidationUtil.MSG.PASSWORD_NOT_MATCH);
    if (phoneNumber !== '' && !ValidationUtil.isValidPhone(phoneNumber)) errors.push(ValidationUtil.MSG.PHONE_INVALID);

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (!confirm('회원가입을 진행하시겠습니까?')) return;

    try {
      const response = await axios.post('/api/register', {
        nickname,
        email,
        password,
        phoneNumber,
        zipCode,
        addressBase,
        addressDetail,
        addressExtra,
      });

      if (response.data === true || response.data.success) {
        alert('회원가입이 완료되었습니다.');
        navigate('/login');
      } else {
        alert('회원가입 중 오류가 발생했습니다.');
      }
    } catch {
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-gradient-primary" style={{ minHeight: '100vh' }}>
      <div className="container">
        <div className="card o-hidden border-0 shadow-lg my-5">
          <div className="card-body p-0">
            <div className="row">
              <div className="col-lg-5 d-none d-lg-block bg-register-image"></div>
              <div className="col-lg-7">
                <div className="p-5">
                  <div className="text-center">
                    <h1 className="h4 text-gray-900 mb-4">회원가입</h1>
                  </div>
                  <form className="user">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control form-control-user"
                        placeholder="이름"
                        maxLength={10}
                        value={nickname}
                        onChange={(e) => handleNicknameInput(e.target.value)}
                        onBlur={handleNicknameBlur}
                      />
                      {nicknameMsg && (
                        <small style={{ display: 'block', marginTop: '5px', color: nicknameMsgColor }}>
                          {nicknameMsg}
                        </small>
                      )}
                    </div>
                    <div className="form-group row">
                      <div className="col-sm-9 mb-3 mb-sm-0">
                        <input
                          type="email"
                          className="form-control form-control-user"
                          placeholder="이메일주소"
                          maxLength={254}
                          value={email}
                          onChange={(e) => handleEmailInput(e.target.value)}
                        />
                      </div>
                      <div className="col-sm-3">
                        <a
                          className="btn btn-primary btn-user btn-block"
                          href="#"
                          onClick={handleCheckEmail}
                        >
                          중복확인
                        </a>
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-sm-6 mb-3 mb-sm-0">
                        <input
                          type="password"
                          className="form-control form-control-user"
                          placeholder="비밀번호"
                          maxLength={15}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onBlur={handlePasswordBlur}
                        />
                      </div>
                      <div className="col-sm-6">
                        <input
                          type="password"
                          className="form-control form-control-user"
                          placeholder="비밀번호 확인"
                          maxLength={15}
                          value={passwordConfirm}
                          onChange={(e) => setPasswordConfirm(e.target.value)}
                          onBlur={handlePasswordConfirmBlur}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <input
                        type="tel"
                        className="form-control form-control-user"
                        placeholder="휴대폰번호"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneInput(e.target.value)}
                        onBlur={handlePhoneBlur}
                      />
                    </div>
                    <div className="form-group row">
                      <div className="col-sm-9 mb-3 mb-sm-0">
                        <input
                          type="text"
                          className="form-control form-control-user"
                          placeholder="주소"
                          readOnly
                          value={addressBase}
                        />
                      </div>
                      <div className="col-sm-3">
                        <a
                          className="btn btn-primary btn-user btn-block"
                          href="#"
                          onClick={handleFindAddress}
                        >
                          주소찾기
                        </a>
                      </div>
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control form-control-user"
                        placeholder="상세주소"
                        maxLength={50}
                        ref={addressDetailRef}
                        value={addressDetail}
                        onChange={(e) => setAddressDetail(e.target.value)}
                      />
                    </div>
                    <div className="form-group row">
                      <div className="col-sm-6 mb-3 mb-sm-0">
                        <input
                          type="text"
                          className="form-control form-control-user"
                          placeholder="우편번호"
                          readOnly
                          value={zipCode}
                        />
                      </div>
                      <div className="col-sm-6">
                        <input
                          type="text"
                          className="form-control form-control-user"
                          placeholder="참고사항"
                          readOnly
                          value={addressExtra}
                        />
                      </div>
                    </div>

                    <a
                      className="btn btn-primary btn-user btn-block"
                      href="#"
                      onClick={handleRegister}
                    >
                      Register Account
                    </a>
                  </form>
                  <hr />
                  <div className="text-center">
                    <Link className="small" to="/login">
                      Already have an account? Login!
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MembershipPage;
