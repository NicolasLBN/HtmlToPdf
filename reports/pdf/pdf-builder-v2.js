import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { makeMetadataTable } from './metadata-table/make-metadata-table';
import { mapMetadata } from './metadata-table/map-metadata';
import { svgsToCanvas } from './utils/svg-to-canvas-utils';
import { mapRecordedData } from './recorded-data-table/map-recorded-data';
import { makeRecordedDataTable } from './recorded-data-table/make-recorded-data-table';
import { helveticaRegularBase64 } from './fonts/helvetica-regular';
import { helveticaBoldBase64 } from './fonts/helvetica-bold';

export class PdfBuilderV2 {


  constructor(
      fileName,
      svgs,
      settings,
      report,
      t,
      localeCode
  ) {
    this.doc = null
    this.vPosition = null

    this.fileName = fileName
    this.svgs = svgs
    this.settings = settings
    this.report = report
    this.t = t
    this.localeCode = localeCode
  }

  async save() {
    if (!this.doc) {
      throw Error('Document has not been built');
    }

    const metadata = {}
    metadata.server_version = this.report.server_version || null
    metadata.launchNumber = this.report.launchNumber || null
    metadata.totalUptime = this.report.totalUptime || null
    metadata.jobs = this.report.jobs || null
    metadata.clampingCount_end = this.report.clampingCount || null
    metadata.clampingCount_start = this.report.parameters.machine.clampingCount
    metadata.totalDistance = this.report.totalDistance || null
    let rangeOffset = null
    if (this.report.rangeOffset && this.report.rangeOffset.open) {
      rangeOffset = this.report.rangeOffset.open
    }
    metadata.rangeOffset = rangeOffset
    metadata.encoderWheel = this.report.encoderWheel || null
    metadata.profileOffset = this.report.profileOffset || null

    let values = []
    for (const [_, value] of Object.entries(metadata)) {
      values.push(String(value))
    }

    this.doc.setProperties({
      title: this.report.filename,
      subject: this.report.id,
      author: window.location.hostname,
      keywords: values.join(','),
      creator: "Plumettaz SA"
    });
    await this.doc.save(this.fileName, { returnPromise: true });
  }

  async build() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });
    this.doc.addFileToVFS("Helvetica-Regular.ttf", helveticaRegularBase64);
    this.doc.addFont("Helvetica-Regular.ttf", "helvetica", "normal");

    this.doc.addFileToVFS("Helvetica-Bold.ttf", helveticaBoldBase64);
    this.doc.addFont("Helvetica-Bold.ttf", "helvetica", "bold");

    this.doc.setFont("helvetica");

    this.vPosition = 0;

    // Metadata table section
    {
      const data = mapMetadata(this.settings, this.report, this.t, this.localeCode);
      autoTable(this.doc, {
        ...makeMetadataTable(data, this.doc.internal.pageSize.width),
      });
      this.vPosition += 120;
    }

    // Graph section
    {
      this.doc.addImage(await svgsToCanvas(this.svgs, this.vPosition));
      this.vPosition += 108;
    }

    // Recorded data table section
    {
      this.summaryTitle();

      const fullData = mapRecordedData(this.report.data, this.report.isCrashTest, this.t);
      const summaryData = fullData.filter(measure => !!measure.comment);

      autoTable(this.doc, { ...makeRecordedDataTable(summaryData, this.t, this.vPosition) });

      this.doc.addPage('a4', 'p');
      autoTable(this.doc, { ...makeRecordedDataTable(fullData, this.t, 25) });
    }

    this.footer();
  }

  summaryTitle() {
    const title = this.t('highlights.title');
    const subtitle = this.t('highlights.subtitle');

    this.doc.setFontSize(10);
    const titleWidth = this.doc.getTextWidth(title);
    this.doc.text(title, 15, this.vPosition);

    this.doc.setFontSize(8);
    this.doc.text(subtitle, 15 + titleWidth + 1, this.vPosition);

    this.vPosition += 4;
  }

  footer() {
    const distributor = this.settings.distributor;
    const contact = distributor.address.split('\n').join(' ') + ', ' + distributor.email;
    const pageCount = this.doc.internal.pages.length;

    this.doc.setFontSize(8);
    for (let pageNumber = 1; pageNumber < pageCount; pageNumber++) {
      this.doc.setPage(pageNumber);
      this.doc.text(
          contact,
          this.doc.internal.pageSize.width / 2,
          287,
          { align: 'center' }
      );
      this.doc.text(
          `${this.t('footer.page_counter', {number: pageNumber})} — ${this.fileName}`,
          this.doc.internal.pageSize.width / 2,
          291,
          { align: 'center' }
      );
    }
  }
}
