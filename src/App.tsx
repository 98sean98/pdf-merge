import React, { useState } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
} from "@chakra-ui/react";

import FileInput from "./FileInput";
import PDFFrame from "./PDFFrame";

function App() {
  const [pdfFile, setPdfFile] = useState<ArrayBuffer>();

  const [rows, setRows] = useState<number>(4);
  const [columns, setColumns] = useState<number>(2);

  return (
    <Flex p={8} h={"100vh"}>
      <Box mr={20} w={"lg"}>
        <FileInput
          id={"pdf-file"}
          setValue={setPdfFile}
          label={"Upload pdf file"}
          isRequired
        />
        <HStack mt={4} spacing={8}>
          <FormControl>
            <FormLabel>Rows</FormLabel>
            <Input
              id={`rows`}
              size={"sm"}
              type={"number"}
              value={rows}
              min={"1"}
              onChange={(e) => setRows(Number(e.target.value))}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Columns</FormLabel>
            <Input
              id={`columns`}
              size={"sm"}
              type={"number"}
              value={columns}
              min={"1"}
              onChange={(e) => setColumns(Number(e.target.value))}
            />
          </FormControl>
        </HStack>
      </Box>

      <Box flex={1} h={"100%"}>
        <PDFFrame pdfFile={pdfFile} rows={rows} columns={columns} />
      </Box>
    </Flex>
  );
}

export default App;
