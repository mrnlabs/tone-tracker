<template>
  <button :disabled="data.length === 0" class="btn btn-primary btn-download rounded-0 mb-0" @click="exportToPDF" type="button">
    Download PDF
  </button>
</template>

<script setup>
import jsPDF from "jspdf";

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  data: {
    type: Array,
    required: true,
  },
});

function exportToPDF() {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("CRM USER INFORMATION", 10, 10);

  let startX = 5;
  let startY = 25;

  const columnWidths = [25, 25, 35, 28, 20, 30, 30]; // Each column width can be adjusted

  // Set table headers
  doc.setFontSize(11);
  let currentX = startX;

  props.headers.forEach((header, index) => {
    doc.text(header, currentX + 2, startY); // Align header to the left of each column
    currentX += columnWidths[index]; // Move X for the next column
  });

  // Add a horizontal line below headers
  startY += 5;
  doc.line(startX, startY, 200, startY);

  // Set table body data
  startY += 5;
  doc.setFontSize(10);

  props.data.forEach((user) => {
    currentX = startX; // Reset X for each new row

    const row = [
      user.name || "",
      user.surname || "",
      user.email || "",
      user.phone || "",
      user.optIn || "false",
      user.activationName || "",
      user.regionName || "",
    ];

    row.forEach((column, index) => {
      doc.text(column.toString(), currentX + 2, startY); // Align each column in the correct X position
      currentX += columnWidths[index]; // Move X for the next column
    });

    // Move to the next line
    startY += 10;

    // Add page break if necessary
    if (startY > 280) {
      doc.addPage();
      startY = 30;
    }
  });

  // Save the PDF
  doc.save("crm.pdf");
}
</script>
