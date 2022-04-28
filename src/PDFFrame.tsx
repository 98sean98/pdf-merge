import React, { FC, useEffect, useRef, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { Box, Center, Text } from "@chakra-ui/react";

interface PDFFrameProps {
  pdfFile: ArrayBuffer | undefined;
  rows: number;
  columns: number;
}

const PDFFrame: FC<PDFFrameProps> = ({ pdfFile, rows, columns }) => {
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

      const elementCount = rows * columns;
      const pageCount = Math.ceil(embeddedPages.length / elementCount);
      for (let i = 0; i < pageCount; i++) {
        const subsetPages = embeddedPages.slice(
          i * elementCount,
          (i + 1) * elementCount
        );
        const page = pdfDoc.addPage();
        const pageSize = page.getSize();

        const embeddedPageWidth = pageSize.width / columns;
        const embeddedPageHeight = pageSize.height / rows;
        const xPositions = Array.from(
          { length: columns },
          (_, i) => i * embeddedPageWidth
        );
        const yPositions = Array.from(
          { length: rows },
          (_, i) => embeddedPageHeight * (rows - i - 1)
        );

        subsetPages.forEach((embeddedPage, index) => {
          const scale = Math.min(
            embeddedPageHeight / embeddedPage.height,
            embeddedPageWidth / embeddedPage.width
          );
          const columnIndex = index % columns,
            rowIndex = Math.floor(index / columns);
          const width = embeddedPage.width * scale,
            height = embeddedPage.height * scale,
            x = xPositions[columnIndex],
            y = yPositions[rowIndex];

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
    <Box mt={8} flex={1} position={"relative"}>
      <iframe ref={pdfRef} width="100%" height="100%" title={"pdf"} />;
      {loading ? (
        <Center pos={"absolute"} inset={0}>
          <Text>Loading</Text>
        </Center>
      ) : (
        <></>
      )}
    </Box>
  );
};

export default PDFFrame;
