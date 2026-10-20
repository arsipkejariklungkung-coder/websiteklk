#!/usr/bin/env python3
"""
Pure-Python Microsoft Excel (.xlsx OpenXML) & CSV Export/Import Engine
for KERTAGOSA Portal (MASADU, SEMARA BAKTI, and JAGADITA).
Zero external dependencies (uses Python stdlib zipfile, xml.etree.ElementTree, io, csv).
"""
import csv
import io
import re
import zipfile
import xml.etree.ElementTree as ET
from xml.sax.saxutils import escape as xml_escape


def _col_index_to_letter(idx: int) -> str:
    """Convert 0-based column index to Excel column letter (0 -> A, 25 -> Z, 26 -> AA)."""
    result = ""
    idx += 1
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        result = chr(65 + rem) + result
    return result


def _col_letter_to_index(col_str: str) -> int:
    """Convert Excel column letters (e.g. 'A', 'BC') to 0-based column index."""
    idx = 0
    for ch in col_str.upper():
        if 'A' <= ch <= 'Z':
            idx = idx * 26 + (ord(ch) - 64)
    return max(0, idx - 1)


def build_xlsx_bytes(sheets: list) -> bytes:
    """
    Build a genuine Microsoft Excel (.xlsx) OpenXML workbook in memory.
    `sheets` is a list of dicts:
      [
        {
          "name": "Aduan MASADU",
          "headers": ["No. Tiket", "Pelapor", ...],
          "rows": [["TRK-MASADU-1001", "Wayan", ...], ...]
        },
        ...
      ]
    """
    if not sheets:
        sheets = [{"name": "Data", "headers": ["Info"], "rows": [["Tidak ada data"]]}]

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. [Content_Types].xml
        sheet_overrides = "".join(
            f'<Override PartName="/xl/worksheets/sheet{i}.xml" '
            f'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
            for i in range(1, len(sheets) + 1)
        )
        content_types_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
            '<Default Extension="xml" ContentType="application/xml"/>'
            '<Override PartName="/xl/workbook.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
            '<Override PartName="/xl/styles.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
            f'{sheet_overrides}'
            '</Types>'
        )
        zf.writestr("[Content_Types].xml", content_types_xml)

        # 2. _rels/.rels
        root_rels_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            '<Relationship Id="rId1" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
            'Target="xl/workbook.xml"/>'
            '</Relationships>'
        )
        zf.writestr("_rels/.rels", root_rels_xml)

        # 3. xl/workbook.xml
        sheet_tags = []
        for i, sh in enumerate(sheets, start=1):
            clean_name = re.sub(r'[\[\]\*\?\/\\:]', ' ', str(sh.get("name", f"Sheet{i}"))).strip()[:31] or f"Sheet{i}"
            sheet_tags.append(
                f'<sheet name="{xml_escape(clean_name)}" sheetId="{i}" r:id="rId{i}"/>'
            )
        workbook_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
            'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
            f'<sheets>{"".join(sheet_tags)}</sheets>'
            '</workbook>'
        )
        zf.writestr("xl/workbook.xml", workbook_xml)

        # 4. xl/_rels/workbook.xml.rels
        wb_rels = [
            f'<Relationship Id="rId{i}" '
            f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{i}.xml"/>'
            for i in range(1, len(sheets) + 1)
        ]
        wb_rels.append(
            f'<Relationship Id="rId{len(sheets) + 1}" '
            f'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" '
            f'Target="styles.xml"/>'
        )
        wb_rels_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
            f'{"".join(wb_rels)}'
            '</Relationships>'
        )
        zf.writestr("xl/_rels/workbook.xml.rels", wb_rels_xml)

        # 5. xl/styles.xml (Style 0 = Default, Style 1 = Emerald Header with White Bold Text, Style 2 = Data Cell with border)
        styles_xml = (
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            '<fonts count="2">'
            '<font><sz val="11"/><color rgb="FF1E293B"/><name val="Calibri"/></font>'
            '<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>'
            '</fonts>'
            '<fills count="3">'
            '<fill><patternFill patternType="none"/></fill>'
            '<fill><patternFill patternType="gray125"/></fill>'
            '<fill><patternFill patternType="solid"><fgColor rgb="FF0B3B24"/><bgColor indexed="64"/></patternFill></fill>'
            '</fills>'
            '<borders count="2">'
            '<border><left/><right/><top/><bottom/><diagonal/></border>'
            '<border>'
            '<left style="thin"><color rgb="FFCBD5E1"/></left>'
            '<right style="thin"><color rgb="FFCBD5E1"/></right>'
            '<top style="thin"><color rgb="FFCBD5E1"/></top>'
            '<bottom style="thin"><color rgb="FFCBD5E1"/></bottom>'
            '<diagonal/>'
            '</border>'
            '</borders>'
            '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
            '<cellXfs count="3">'
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
            '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">'
            '<alignment vertical="center" wrapText="1"/>'
            '</xf>'
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1">'
            '<alignment vertical="top" wrapText="1"/>'
            '</xf>'
            '</cellXfs>'
            '</styleSheet>'
        )
        zf.writestr("xl/styles.xml", styles_xml)

        # 6. Each worksheet xl/worksheets/sheet{i}.xml
        for i, sh in enumerate(sheets, start=1):
            headers = sh.get("headers", [])
            rows = sh.get("rows", [])
            all_rows = [headers] + list(rows) if headers else list(rows)

            # Calculate column widths
            num_cols = max((len(r) for r in all_rows), default=1)
            cols_xml_parts = []
            for c_idx in range(num_cols):
                max_len = 12
                for r in all_rows:
                    if c_idx < len(r) and r[c_idx] is not None:
                        val_str = str(r[c_idx])
                        max_len = max(max_len, min(48, len(val_str) + 4))
                cols_xml_parts.append(
                    f'<col min="{c_idx + 1}" max="{c_idx + 1}" width="{max_len}" customWidth="1"/>'
                )
            cols_xml = f'<cols>{"".join(cols_xml_parts)}</cols>' if cols_xml_parts else ''

            row_xml_parts = []
            for r_idx, row_vals in enumerate(all_rows, start=1):
                style_id = 1 if (r_idx == 1 and headers) else 2
                ht_attr = ' ht="26" customHeight="1"' if r_idx == 1 else ''
                cell_parts = []
                for c_idx, val in enumerate(row_vals):
                    col_letter = _col_index_to_letter(c_idx)
                    cell_ref = f"{col_letter}{r_idx}"
                    text_val = "" if val is None else str(val)
                    # Sanitize control characters invalid in XML 1.0
                    text_val = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F]', '', text_val)
                    escaped_val = xml_escape(text_val)
                    cell_parts.append(
                        f'<c r="{cell_ref}" s="{style_id}" t="inlineStr">'
                        f'<is><t xml:space="preserve">{escaped_val}</t></is>'
                        f'</c>'
                    )
                row_xml_parts.append(f'<row r="{r_idx}"{ht_attr}>{"".join(cell_parts)}</row>')

            sheet_xml = (
                '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
                f'{cols_xml}'
                f'<sheetData>{"".join(row_xml_parts)}</sheetData>'
                '</worksheet>'
            )
            zf.writestr(f"xl/worksheets/sheet{i}.xml", sheet_xml)

    return buf.getvalue()


def build_csv_bytes(headers: list, rows: list) -> bytes:
    """Build UTF-8 with BOM CSV bytes so Microsoft Excel opens it with proper column splitting."""
    out = io.StringIO()
    writer = csv.writer(out)
    if headers:
        writer.writerow(headers)
    for r in rows:
        writer.writerow(["" if v is None else str(v) for v in r])
    return ("\ufeff" + out.getvalue()).encode("utf-8")


def parse_excel_or_csv_bytes(file_bytes: bytes, filename: str = "") -> list:
    """
    Parse an uploaded .xlsx (OpenXML Excel) or .csv / .tsv file into a list of dictionaries
    keyed by normalized column header names (and also returns raw rows if needed).
    Returns a list of dicts (one per non-empty data row).
    """
    if not file_bytes:
        return []

    rows_matrix = []

    # 1. Check if it's a ZIP archive (.xlsx)
    if file_bytes[:4] == b'PK\x03\x04':
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes), "r") as zf:
                namelist = zf.namelist()
                # Load sharedStrings.xml if present
                shared_strings = []
                if "xl/sharedStrings.xml" in namelist:
                    ss_root = ET.fromstring(zf.read("xl/sharedStrings.xml"))
                    for si in ss_root.iter():
                        if si.tag.endswith("}si") or si.tag == "si":
                            texts = []
                            for t_node in si.iter():
                                if (t_node.tag.endswith("}t") or t_node.tag == "t") and t_node.text:
                                    texts.append(t_node.text)
                            shared_strings.append("".join(texts))

                # Find first worksheet
                sheet_files = sorted(
                    n for n in namelist if n.startswith("xl/worksheets/sheet") and n.endswith(".xml")
                )
                if sheet_files:
                    ws_root = ET.fromstring(zf.read(sheet_files[0]))
                    for row_el in ws_root.iter():
                        if row_el.tag.endswith("}row") or row_el.tag == "row":
                            row_cells = {}
                            max_col = -1
                            for c_el in row_el:
                                if not (c_el.tag.endswith("}c") or c_el.tag == "c"):
                                    continue
                                ref = c_el.attrib.get("r", "")
                                col_letters = "".join(ch for ch in ref if ch.isalpha())
                                col_idx = _col_letter_to_index(col_letters) if col_letters else (max_col + 1)
                                max_col = max(max_col, col_idx)

                                c_type = c_el.attrib.get("t", "")
                                cell_val = ""
                                if c_type == "inlineStr":
                                    t_parts = []
                                    for sub in c_el.iter():
                                        if (sub.tag.endswith("}t") or sub.tag == "t") and sub.text:
                                            t_parts.append(sub.text)
                                    cell_val = "".join(t_parts)
                                else:
                                    v_text = ""
                                    for sub in c_el:
                                        if (sub.tag.endswith("}v") or sub.tag == "v") and sub.text is not None:
                                            v_text = sub.text
                                            break
                                    if c_type == "s":
                                        try:
                                            ss_idx = int(v_text)
                                            if 0 <= ss_idx < len(shared_strings):
                                                cell_val = shared_strings[ss_idx]
                                        except ValueError:
                                            cell_val = v_text
                                    else:
                                        cell_val = v_text
                                row_cells[col_idx] = (cell_val or "").strip()

                            if max_col >= 0:
                                row_list = [row_cells.get(i, "") for i in range(max_col + 1)]
                                if any(cell != "" for cell in row_list):
                                    rows_matrix.append(row_list)
        except Exception as e:
            raise ValueError(f"File Excel (.xlsx) tidak dapat dibaca: {str(e)}")
    else:
        # 2. Fallback: CSV / TSV text file
        text = file_bytes.decode("utf-8-sig", errors="replace")
        # Auto-detect delimiter (; or , or \t)
        first_line = text.splitlines()[0] if text.splitlines() else ""
        delimiter = ","
        if "\t" in first_line:
            delimiter = "\t"
        elif first_line.count(";") > first_line.count(","):
            delimiter = ";"
        reader = csv.reader(io.StringIO(text), delimiter=delimiter)
        for r in reader:
            cleaned = [c.strip() for c in r]
            if any(cleaned):
                rows_matrix.append(cleaned)

    if len(rows_matrix) < 2:
        return []

    raw_headers = rows_matrix[0]
    norm_headers = [
        re.sub(r'[^a-z0-9]+', '_', h.lower()).strip('_') or f"col_{i}"
        for i, h in enumerate(raw_headers)
    ]

    records = []
    for r in rows_matrix[1:]:
        if not any(c.strip() for c in r):
            continue
        item = {}
        for i, h_key in enumerate(norm_headers):
            val = r[i].strip() if i < len(r) else ""
            item[h_key] = val
            item[f"_col_{i}"] = val
        records.append(item)

    return records
