import React, { FC, useEffect, useRef, useState } from "react";
import { PDFDocument, PageSizes } from "pdf-lib";
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

      const emptyPage = pdfDoc.addPage(PageSizes.A4);
      const pageSize = emptyPage.getSize();

      const embeddedPageWidth = pageSize.width / columns;
      const embeddedPageHeight = pageSize.height / rows;

      const sourcePages = sourcePdfDoc.getPages();

      sourcePages.forEach((page, i) => {
        const currentSize = page.getSize();
        const scale = Math.min(
          embeddedPageHeight / currentSize.height,
          embeddedPageWidth / currentSize.width
        );
        page.scale(scale, scale);
      });

      // remove empty page
      pdfDoc.removePage(0);

      const embeddedPages = await pdfDoc.embedPdf(sourcePdfDoc, ar);

      const elementCount = rows * columns;
      const pageCount = Math.ceil(embeddedPages.length / elementCount);
      for (let i = 0; i < pageCount; i++) {
        const subsetPages = embeddedPages.slice(
          i * elementCount,
          (i + 1) * elementCount
        );
        const page = pdfDoc.addPage(PageSizes.A4);

        const xPositions = Array.from(
          { length: columns },
          (_, i) => i * embeddedPageWidth
        );
        const yPositions = Array.from(
          { length: rows },
          (_, i) => embeddedPageHeight * (rows - i - 1)
        );

        subsetPages.forEach((embeddedPage, index) => {
          const columnIndex = index % columns,
            rowIndex = Math.floor(index / columns);
          const x = xPositions[columnIndex],
            y = yPositions[rowIndex];

          page.drawPage(embeddedPage, { x, y });
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
    <Box h={"full"} position={"relative"}>
      <iframe ref={pdfRef} width="100%" height="100%" title={"pdf"} />
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
