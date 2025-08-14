import * as XLSX from 'xlsx';
import { ExcelTemplate, MasterData, RFP } from '../types/rfp';

export class ExcelService {
  generateExcelFromTemplate(
    template: ExcelTemplate,
    masterData: MasterData,
    mappedData: any
  ): ArrayBuffer {
    const workbook = XLSX.utils.book_new();

    template.sheets.forEach(sheetConfig => {
      const worksheet = this.createWorksheet(sheetConfig, masterData, mappedData);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetConfig.name);
    });

    return XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });
  }

  private createWorksheet(
    sheetConfig: ExcelTemplate['sheets'][0],
    masterData: MasterData,
    mappedData: any
  ): XLSX.WorkSheet {
    const data: any[][] = [];
    
    // 헤더 행 생성
    const headers = sheetConfig.columns.map(col => col.header);
    data.push(headers);

    // 데이터 행 생성
    const rowData = this.generateRowData(sheetConfig, masterData, mappedData);
    data.push(...rowData);

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // 열 너비 설정
    const colWidths = sheetConfig.columns.map(col => ({ wch: col.width }));
    worksheet['!cols'] = colWidths;

    // 셀 스타일 및 포맷 적용
    this.applyCellFormatting(worksheet, sheetConfig, data.length);

    // 수식 적용
    this.applyFormulas(worksheet, sheetConfig, data.length);

    // 유효성 검사 적용
    this.applyValidation(worksheet, sheetConfig);

    // 특수 요구사항 적용
    if (sheetConfig.specialRequirements) {
      this.applySpecialRequirements(worksheet, sheetConfig.specialRequirements);
    }

    return worksheet;
  }

  private generateRowData(
    sheetConfig: ExcelTemplate['sheets'][0],
    masterData: MasterData,
    mappedData: any
  ): any[][] {
    const rowData: any[][] = [];

    // 시트 타입에 따라 다른 데이터 생성 로직
    switch (sheetConfig.name) {
      case '회사개요':
        rowData.push(this.generateCompanyOverviewData(sheetConfig, masterData, mappedData));
        break;
      case '펀드실적':
        rowData.push(...this.generateFundPerformanceData(sheetConfig, masterData, mappedData));
        break;
      case '핵심인력':
        rowData.push(...this.generateKeyPersonnelData(sheetConfig, masterData, mappedData));
        break;
      case '투자실적':
        rowData.push(...this.generateInvestmentData(sheetConfig, masterData, mappedData));
        break;
      default:
        // 커스텀 시트의 경우 매핑된 데이터 사용
        rowData.push(this.generateCustomSheetData(sheetConfig, mappedData));
        break;
    }

    return rowData;
  }

  private generateCompanyOverviewData(
    sheetConfig: ExcelTemplate['sheets'][0],
    masterData: MasterData,
    mappedData: any
  ): any[] {
    return sheetConfig.columns.map(col => {
      switch (col.dataField) {
        case '회사명':
          return masterData.회사정보.회사명;
        case '설립일':
          return masterData.회사정보.설립일.toLocaleDateString();
        case '대표자':
          return masterData.회사정보.대표자;
        case 'AUM':
          return masterData.회사정보.AUM;
        case '주소':
          return masterData.회사정보.주소;
        default:
          return mappedData[col.dataField] || '';
      }
    });
  }

  private generateFundPerformanceData(
    sheetConfig: ExcelTemplate['sheets'][0],
    masterData: MasterData,
    mappedData: any
  ): any[][] {
    return masterData.펀드실적.map(fund => 
      sheetConfig.columns.map(col => {
        switch (col.dataField) {
          case '펀드명':
            return fund.펀드명;
          case '결성일':
            return fund.결성일.toLocaleDateString();
          case '결성액':
            return fund.결성액;
          case '상태':
            return fund.상태;
          case '수익률':
            return fund.수익률;
          default:
            return '';
        }
      })
    );
  }

  private generateKeyPersonnelData(
    sheetConfig: ExcelTemplate['sheets'][0],
    masterData: MasterData,
    mappedData: any
  ): any[][] {
    return masterData.핵심인력.map(person => 
      sheetConfig.columns.map(col => {
        switch (col.dataField) {
          case '이름':
            return person.이름;
          case '직책':
            return person.직책;
          case '경력년수':
            return person.경력년수;
          case '학력':
            return person.학력;
          case '주요경험':
            return person.주요경험.join(', ');
          default:
            return '';
        }
      })
    );
  }

  private generateInvestmentData(
    sheetConfig: ExcelTemplate['sheets'][0],
    masterData: MasterData,
    mappedData: any
  ): any[][] {
    return masterData.투자실적.map(investment => 
      sheetConfig.columns.map(col => {
        switch (col.dataField) {
          case '포트폴리오명':
            return investment.포트폴리오명;
          case '투자일':
            return investment.투자일.toLocaleDateString();
          case '투자액':
            return investment.투자액;
          case '분야':
            return investment.분야;
          case '현재상태':
            return investment.현재상태;
          default:
            return '';
        }
      })
    );
  }

  private generateCustomSheetData(
    sheetConfig: ExcelTemplate['sheets'][0],
    mappedData: any
  ): any[] {
    return sheetConfig.columns.map(col => 
      mappedData[col.dataField] || ''
    );
  }

  private applyCellFormatting(
    worksheet: XLSX.WorkSheet,
    sheetConfig: ExcelTemplate['sheets'][0],
    rowCount: number
  ): void {
    sheetConfig.columns.forEach((col, colIndex) => {
      for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        
        if (!worksheet[cellAddress]) continue;

        const cellStyle: any = {};

        switch (col.format) {
          case 'number':
            cellStyle.numFmt = '#,##0';
            break;
          case 'currency':
            cellStyle.numFmt = '#,##0"원"';
            break;
          case 'percent':
            cellStyle.numFmt = '0.00%';
            break;
          case 'date':
            cellStyle.numFmt = 'yyyy-mm-dd';
            break;
        }

        if (Object.keys(cellStyle).length > 0) {
          worksheet[cellAddress].s = cellStyle;
        }
      }
    });
  }

  private applyFormulas(
    worksheet: XLSX.WorkSheet,
    sheetConfig: ExcelTemplate['sheets'][0],
    rowCount: number
  ): void {
    sheetConfig.columns.forEach((col, colIndex) => {
      if (!col.formula) return;

      for (let rowIndex = 1; rowIndex < rowCount; rowIndex++) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        
        // 수식에서 행 번호 치환
        const formula = col.formula.replace(/ROW/g, (rowIndex + 1).toString());
        
        worksheet[cellAddress] = {
          f: formula,
          t: 'n'
        };
      }
    });
  }

  private applyValidation(
    worksheet: XLSX.WorkSheet,
    sheetConfig: ExcelTemplate['sheets'][0]
  ): void {
    // Excel의 데이터 유효성 검사는 라이브러리 제한으로 인해 간단한 형태만 구현
    sheetConfig.columns.forEach((col, colIndex) => {
      if (!col.validation) return;
      
      // 여기서 실제 유효성 검사 규칙을 적용할 수 있습니다
      // 현재는 주석으로만 표시
    });
  }

  private applySpecialRequirements(
    worksheet: XLSX.WorkSheet,
    requirements: ExcelTemplate['sheets'][0]['specialRequirements']
  ): void {
    if (!requirements) return;

    // 조건부 서식
    if (requirements.conditionalFormatting) {
      // Excel의 조건부 서식은 복잡하므로 기본 구현만 제공
    }

    // 보호된 셀
    if (requirements.protectedCells) {
      requirements.protectedCells.forEach(cellRange => {
        // 셀 보호 설정
      });
    }
  }

  createTemplateFromRFP(rfp: RFP): ExcelTemplate {
    const template: ExcelTemplate = {
      rfpId: rfp.id,
      sheets: [
        {
          name: '회사개요',
          required: true,
          columns: [
            { header: '회사명', dataField: '회사명', width: 20 },
            { header: '설립일', dataField: '설립일', width: 12, format: 'date' },
            { header: '대표자', dataField: '대표자', width: 15 },
            { header: 'AUM', dataField: 'AUM', width: 15, format: 'currency' },
            { header: '주소', dataField: '주소', width: 30 }
          ]
        },
        {
          name: '펀드실적',
          required: true,
          columns: [
            { header: '펀드명', dataField: '펀드명', width: 25 },
            { header: '결성일', dataField: '결성일', width: 12, format: 'date' },
            { header: '결성액', dataField: '결성액', width: 15, format: 'currency' },
            { header: '상태', dataField: '상태', width: 12 },
            { header: '수익률(%)', dataField: '수익률', width: 12, format: 'percent' }
          ]
        },
        {
          name: '핵심인력',
          required: true,
          columns: [
            { header: '이름', dataField: '이름', width: 15 },
            { header: '직책', dataField: '직책', width: 20 },
            { header: '경력년수', dataField: '경력년수', width: 12, format: 'number' },
            { header: '학력', dataField: '학력', width: 25 },
            { header: '주요경험', dataField: '주요경험', width: 40 }
          ]
        },
        {
          name: '투자실적',
          required: true,
          columns: [
            { header: '포트폴리오명', dataField: '포트폴리오명', width: 25 },
            { header: '투자일', dataField: '투자일', width: 12, format: 'date' },
            { header: '투자액', dataField: '투자액', width: 15, format: 'currency' },
            { header: '분야', dataField: '분야', width: 15 },
            { header: '현재상태', dataField: '현재상태', width: 15 }
          ]
        }
      ]
    };

    // RFP별 특수 조건에 따른 추가 시트
    if (rfp.requirements.특수조건.제한사항.some(condition => 
      condition.includes('AI') || condition.includes('안전성')
    )) {
      template.sheets.push({
        name: 'AI안전성투자계획',
        required: true,
        columns: [
          { header: '투자분야', dataField: '투자분야', width: 20 },
          { header: '투자비중(%)', dataField: '투자비중', width: 15, format: 'percent' },
          { header: '예상금액', dataField: '예상금액', width: 15, format: 'currency', formula: 'B2*조합규모' },
          { header: '투자전략', dataField: '투자전략', width: 40 }
        ]
      });
    }

    return template;
  }

  downloadExcel(buffer: ArrayBuffer, filename: string): void {
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  readExcelFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          
          const result: any = {};
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsArrayBuffer(file);
    });
  }
}