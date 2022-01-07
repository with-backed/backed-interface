import { ChangeEvent } from 'react';

const onTextInputChanged = (
  event: ChangeEvent<HTMLInputElement>,
  setValue: (val: string) => void,
) => {
  const newValue = event.target.value.trim();

  if (newValue.length < 3) {
    setValue('');
  } else {
    setValue(newValue);
  }
};

export type AdvancedSearchTextInputProps = {
  handleTextInputChanged: (
    event: ChangeEvent<HTMLInputElement>,
    setValue: (val: string) => void,
  ) => void;
  setTextState: (token: string) => void;
};
