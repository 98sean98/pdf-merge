import React, { ChangeEvent, FC } from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

const FileInput: FC<{
  id: string;
  setValue: (value: ArrayBuffer) => void;
  label: string;
  isRequired: boolean;
}> = ({ id, setValue, label, isRequired }) => {
  const reader = new FileReader();

  reader.onload = () => {
    setValue(reader.result as ArrayBuffer);
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <FormControl id={id} isRequired={isRequired}>
      <FormLabel>{label}</FormLabel>
      <Input size={"sm"} type="file" variant={"unstyled"} onChange={onChange} />
    </FormControl>
  );
};

export default FileInput;
