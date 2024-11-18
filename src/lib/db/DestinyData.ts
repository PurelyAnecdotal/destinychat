export interface DestinyData {
    "?xml":              string;
    DestinyCustomReport: DestinyCustomReport;
}

export interface DestinyCustomReport {
    Row: Book[];
}

export interface Book {
    copyBarcode:   string;
    callNumber:    string;
    sublocation?:  string;
    author?:       string;
    subject?:      string;
    title:         number | string;
    description1?: string;
}