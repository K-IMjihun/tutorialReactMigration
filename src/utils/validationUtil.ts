const REGEXP = {
  PASSWORD: /(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,15}/,
  NICKNAME: /^[a-zA-Z0-9]{1,10}$/,
  EMAIL: /^([A-Za-z0-9]+([-_.]?[A-Za-z0-9]+)*)@([A-Za-z0-9]+([-]?[A-Za-z0-9]+)*)(\.([A-Za-z0-9]+([-]?[A-Za-z0-9]+)*))?(\.([A-Za-z0-9]+([-]?[A-Za-z0-9]+)*))?((\.([A-Za-z]{2,63}))$)/,
  PHONE: /^\d{2,3}-\d{3,4}-\d{4}$/,
};

export const ValidationUtil = {
  isValidNickname: (value: string) => REGEXP.NICKNAME.test(value),
  isValidEmail: (value: string) => REGEXP.EMAIL.test(value),
  isValidPassword: (value: string) => REGEXP.PASSWORD.test(value),
  isValidPhone: (value: string) => REGEXP.PHONE.test(value),
  isPasswordMatch: (password: string, passwordConfirm: string) => password === passwordConfirm,
  isValidNicknameLength: (value: string) => value.length > 0 && value.length <= 10,
  filterNickname: (value: string) => value.replace(/[^a-zA-Z0-9]/g, ''),

  MSG: {
    NICKNAME_EMPTY: '닉네임을 입력해주세요.',
    NICKNAME_LENGTH: '10글자 이하로 가능합니다.',
    NICKNAME_INVALID: '사용 불가능한 닉네임입니다.',
    NICKNAME_VALID: '사용 가능한 닉네임입니다.',
    EMAIL_EMPTY: '이메일을 입력해주세요.',
    EMAIL_INVALID: '이메일 중복확인이 필요합니다.',
    PASSWORD_EMPTY: '비밀번호를 입력해주세요.',
    PASSWORD_INVALID: '비밀번호는 8~15자, 숫자, 특수문자를 포함해야 합니다.',
    PASSWORD_CONFIRM_EMPTY: '비밀번호 확인을 입력해주세요.',
    PASSWORD_MATCH: '비밀번호가 일치합니다.',
    PASSWORD_NOT_MATCH: '비밀번호가 일치하지 않습니다.',
    PHONE_EMPTY: '휴대폰번호를 입력해주세요.',
    PHONE_VALID: '사용 가능한 전화번호 입니다.',
    PHONE_INVALID: '사용 불가능한 전화번호 입니다.',
    ADDRESS_EMPTY: '주소를 입력해주세요.',
  },
};
