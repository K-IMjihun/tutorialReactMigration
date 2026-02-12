interface DaumPostcodeData {
  zonecode: string;
  roadAddress: string;
  jibunAddress: string;
  userSelectedType: string;
  bname: string;
  buildingName: string;
  apartment: string;
}

interface DaumPostcodeOptions {
  oncomplete: (data: DaumPostcodeData) => void;
}

interface DaumPostcode {
  new (options: DaumPostcodeOptions): { open: () => void };
}

interface Daum {
  Postcode: DaumPostcode;
}

declare const daum: Daum;
