import React, { useEffect, useRef, useState } from "react";
import { Box, Center, Flex, Text } from "@chakra-ui/react";
import { PDFDocument } from "pdf-lib";

import FileInput from "./FileInput";

function App() {
  const [pdfFile, setPdfFile] = useState<ArrayBuffer>();
  const pdfRef = useRef<HTMLIFrameElement>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function f() {
      setLoading(true);
      const pdfDoc = await PDFDocument.create();

      const sourcePdfDoc = await PDFDocument.load(pdfFile!);

      const ar = Array.from(
        { length: sourcePdfDoc.getPageCount() },
        (_, i) => i
      );
      const embeddedPages = await pdfDoc.embedPdf(sourcePdfDoc, ar);

      const pageCount = Math.ceil(embeddedPages.length / 8);
      for (let i = 0; i < pageCount; i++) {
        const subsetPages = embeddedPages.slice(i * 8, (i + 1) * 8);
        const page = pdfDoc.addPage();
        const pageSize = page.getSize();

        const embeddedPageHeight = pageSize.height / 4;
        const halfWidth = pageSize.width / 2;
        const yPositions = [
          0,
          embeddedPageHeight,
          embeddedPageHeight * 2,
          embeddedPageHeight * 3,
        ];

        subsetPages.forEach((embeddedPage, index) => {
          const scale = embeddedPageHeight / embeddedPage.height;
          const width = embeddedPage.width * scale,
            height = embeddedPage.height * scale,
            x = index % 2 === 0 ? 0 : halfWidth,
            y = yPositions[3 - Math.floor(index / 2)];
          page.drawPage(embeddedPage, { x, y, width, height });
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const blobUrl = window.URL.createObjectURL(blob);
      if (pdfRef.current) {
        pdfRef.current.src = blobUrl;
      }
      setLoading(false);
    }

    if (typeof pdfFile !== "undefined") {
      f().then();
    }
  }, [pdfFile]);

  return (
    <Flex p={8} direction={"column"} h={"100vh"}>
      <FileInput
        id={"pdf-file"}
        setValue={setPdfFile}
        label={"Upload pdf file"}
        isRequired
      />

      <Box mt={8} flex={1} position={"relative"}>
        <iframe ref={pdfRef} width="100%" height="100%" title={"pdf"} />
        {loading ? (
          <Center pos={"absolute"} inset={0}>
            <Text>Loading</Text>
          </Center>
        ) : (
          <></>
        )}
      </Box>
    </Flex>
  );
}

export default App;
