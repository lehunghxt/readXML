function ToOject(json, name) {
    if (name == 'FPT')
        return toFpt(json);
    else if (name == 'VNPT')
        return toVnpt(json);
    else if (name == '92TBTCT')
        return toThe92Tbtct(json);
    else if (name == '19KHCT')
        return toThe19Khct(json);
}
function toThe19Khct(json) {
    return cast(JSON.parse(json), r("The19Khct"));
}

function the19KhctToJson(value) {
    return JSON.stringify(uncast(value, r("The19Khct")), null, 2);
}

function toThe92Tbtct(json) {
    return cast(JSON.parse(json), r("The92Tbtct"));
}

function the92TbtctToJson(value) {
    return JSON.stringify(uncast(value, r("The92Tbtct")), null, 2);
}

function toFpt(json) {
    return cast(JSON.parse(json), r("Fpt"));
}

function fptToJson(value) {
    return JSON.stringify(uncast(value, r("Fpt")), null, 2);
}

function toVnpt(json) {
    return cast(JSON.parse(json), r("Vnpt"));
}

function vnptToJson(value) {
    return JSON.stringify(uncast(value, r("Vnpt")), null, 2);
}

function invalidValue(typ, val, key = '') {
    if (key) {
        throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
    }
    throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`,);
}

function jsonToJSProps(typ) {
    if (typ.jsonToJS === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        const map = {};
        typ.props.forEach((p) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val, typ, getProps, key = '') {
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key);
    }

    function transformUnion(typs, val) {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) { }
        }
        return invalidValue(typs, val);
    }

    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases, val);
    }

    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue("array", val);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val) {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue("Date", val);
        }
        return d;
    }

    function transformObject(props, additional, val) {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue("object", val);
        }
        const result = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val);
    }
    if (typ === false) return invalidValue(typ, val);
    while (typeof typ === "object" && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                    : invalidValue(typ, val);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast(val, typ) {
    return transform(val, typ, jsonToJSProps);
}

function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}

function a(typ) {
    return { arrayItems: typ };
}

function u(...typs) {
    return { unionMembers: typs };
}

function o(props, additional) {
    return { props, additional };
}

function m(additional) {
    return { props: [], additional };
}

function r(name) {
    return { ref: name };
}

const typeMap = {
    "The19Khct": o([
        { json: "HDon", js: "HDon", typ: r("The19KHCTHDon") },
    ], false),
    "The19KHCTHDon": o([
        { json: "DLHDon", js: "DLHDon", typ: r("PurpleDLHDon") },
        { json: "DSCKS", js: "DSCKS", typ: r("Dscks") },
        { json: "_Id", js: "_Id", typ: "" },
    ], false),
    "PurpleDLHDon": o([
        { json: "TTChung", js: "TTChung", typ: r("PurpleTTChung") },
        { json: "NDHDon", js: "NDHDon", typ: r("PurpleNDHDon") },
        { json: "TTKhac", js: "TTKhac", typ: r("DLHDonTTKhac") },
        { json: "_Id", js: "_Id", typ: "" },
    ], false),
    "PurpleNDHDon": o([
        { json: "NBan", js: "NBan", typ: r("NBan") },
        { json: "NMua", js: "NMua", typ: r("NBan") },
        { json: "DSHHDVu", js: "DSHHDVu", typ: r("PurpleDSHHDVu") },
        { json: "TToan", js: "TToan", typ: r("PurpleTToan") },
    ], false),
    "PurpleDSHHDVu": o([
        { json: "HHDVu", js: "HHDVu", typ: u(a(r("HHDVuElement")), r("HHDVuElement")) },
    ], false),
    "HHDVuElement": o([
        { json: "TChat", js: "TChat", typ: "" },
        { json: "STT", js: "STT", typ: u(undefined, "") },
        { json: "Ten", js: "Ten", typ: u(undefined, "") },
        { json: "DVTinh", js: "DVTinh", typ: "" },
        { json: "SLuong", js: "SLuong", typ: u(undefined, "") },
        { json: "DGia", js: "DGia", typ: "" },
        { json: "TLCKhau", js: "TLCKhau", typ: "" },
        { json: "STCKhau", js: "STCKhau", typ: "" },
        { json: "ThTien", js: "ThTien", typ: "" },
        { json: "TSuat", js: "TSuat", typ: r("TSuat") },
        { json: "TTKhac", js: "TTKhac", typ: u(undefined, "") },
        { json: "TCDChinh", js: "TCDChinh", typ: u(undefined, "") },
        { json: "THHDVu", js: "THHDVu", typ: u(undefined, "") },
    ], false),
    "NBan": o([
        { json: "Ten", js: "Ten", typ: "" },
        { json: "MST", js: "MST", typ: "" },
        { json: "DChi", js: "DChi", typ: "" },
        { json: "TTKhac", js: "TTKhac", typ: u(undefined, r("NBanTTKhac")) },
    ], false),
    "NBanTTKhac": o([
        { json: "TTin", js: "TTin", typ: a(r("TTin")) },
    ], false),
    "TTin": o([
        { json: "TTruong", js: "TTruong", typ: "" },
        { json: "KDLieu", js: "KDLieu", typ: r("KDLieu") },
        { json: "DLieu", js: "DLieu", typ: "" },
    ], false),
    "PurpleTToan": o([
        { json: "THTTLTSuat", js: "THTTLTSuat", typ: r("THTTLTSuat") },
        { json: "TgTCThue", js: "TgTCThue", typ: "" },
        { json: "TgTThue", js: "TgTThue", typ: "" },
        { json: "TgTTTBSo", js: "TgTTTBSo", typ: "" },
        { json: "TgTTTBChu", js: "TgTTTBChu", typ: "" },
        { json: "TTKhac", js: "TTKhac", typ: "" },
    ], false),
    "THTTLTSuat": o([
        { json: "LTSuat", js: "LTSuat", typ: u(a(r("LTSuatElement")), r("LTSuatElement")) },
    ], false),
    "LTSuatElement": o([
        { json: "TSuat", js: "TSuat", typ: r("TSuat") },
        { json: "ThTien", js: "ThTien", typ: "" },
        { json: "TThue", js: "TThue", typ: "" },
    ], false),
    "PurpleTTChung": o([
        { json: "PBan", js: "PBan", typ: "" },
        { json: "THDon", js: "THDon", typ: "" },
        { json: "KHMSHDon", js: "KHMSHDon", typ: "" },
        { json: "KHHDon", js: "KHHDon", typ: "" },
        { json: "SHDon", js: "SHDon", typ: "" },
        { json: "TDLap", js: "TDLap", typ: Date },
        { json: "TDLHDDChinh", js: "TDLHDDChinh", typ: u(undefined, Date) },
        { json: "KHMSHDDChinh", js: "KHMSHDDChinh", typ: u(undefined, "") },
        { json: "KHHDBDChinh", js: "KHHDBDChinh", typ: u(undefined, "") },
        { json: "SHDBDChinh", js: "SHDBDChinh", typ: u(undefined, "") },
        { json: "TChat", js: "TChat", typ: "" },
        { json: "DVTTe", js: "DVTTe", typ: "" },
        { json: "TGia", js: "TGia", typ: "" },
        { json: "TTKhac", js: "TTKhac", typ: r("NBanTTKhac") },
    ], false),
    "DLHDonTTKhac": o([
        { json: "TTin", js: "TTin", typ: r("TTin") },
    ], false),
    "Dscks": o([
        { json: "NBan", js: "NBan", typ: r("DSCKSNBan") },
    ], false),
    "DSCKSNBan": o([
        { json: "Signature", js: "Signature", typ: r("NBanSignature") },
    ], false),
    "NBanSignature": o([
        { json: "SignedInfo", js: "SignedInfo", typ: r("PurpleSignedInfo") },
        { json: "SignatureValue", js: "SignatureValue", typ: "" },
        { json: "KeyInfo", js: "KeyInfo", typ: r("KeyInfo") },
        { json: "Object", js: "Object", typ: r("Object") },
        { json: "_xmlns", js: "_xmlns", typ: "" },
        { json: "_Id", js: "_Id", typ: "" },
    ], false),
    "KeyInfo": o([
        { json: "X509Data", js: "X509Data", typ: r("X509Data") },
    ], false),
    "X509Data": o([
        { json: "X509Certificate", js: "X509Certificate", typ: "" },
    ], false),
    "Object": o([
        { json: "SignatureProperties", js: "SignatureProperties", typ: r("SignatureProperties") },
    ], false),
    "SignatureProperties": o([
        { json: "SignatureProperty", js: "SignatureProperty", typ: r("SignatureProperty") },
    ], false),
    "SignatureProperty": o([
        { json: "SigningTime", js: "SigningTime", typ: Date },
        { json: "_Id", js: "_Id", typ: "" },
        { json: "_Target", js: "_Target", typ: "" },
    ], false),
    "PurpleSignedInfo": o([
        { json: "CanonicalizationMethod", js: "CanonicalizationMethod", typ: r("CanonicalizationMethod") },
        { json: "SignatureMethod", js: "SignatureMethod", typ: r("CanonicalizationMethod") },
        { json: "Reference", js: "Reference", typ: a(r("Reference")) },
    ], false),
    "CanonicalizationMethod": o([
        { json: "_Algorithm", js: "_Algorithm", typ: "" },
    ], false),
    "Reference": o([
        { json: "Transforms", js: "Transforms", typ: r("Transforms") },
        { json: "DigestMethod", js: "DigestMethod", typ: r("CanonicalizationMethod") },
        { json: "DigestValue", js: "DigestValue", typ: "" },
        { json: "_URI", js: "_URI", typ: "" },
    ], false),
    "Transforms": o([
        { json: "Transform", js: "Transform", typ: r("CanonicalizationMethod") },
    ], false),
    "The92Tbtct": o([
        { json: "HDon", js: "HDon", typ: r("The92TBTCTHDon") },
    ], false),
    "The92TBTCTHDon": o([
        { json: "DLHDon", js: "DLHDon", typ: r("FluffyDLHDon") },
        { json: "DSCKS", js: "DSCKS", typ: r("Dscks") },
        { json: "_Id", js: "_Id", typ: "" },
    ], false),
    "FluffyDLHDon": o([
        { json: "TTChung", js: "TTChung", typ: r("FluffyTTChung") },
        { json: "NDHDon", js: "NDHDon", typ: r("FluffyNDHDon") },
        { json: "_Id", js: "_Id", typ: "" },
    ], false),
    "FluffyNDHDon": o([
        { json: "NBan", js: "NBan", typ: r("NBan") },
        { json: "NMua", js: "NMua", typ: r("NBan") },
        { json: "DSHHDVu", js: "DSHHDVu", typ: r("FluffyDSHHDVu") },
        { json: "TToan", js: "TToan", typ: r("FluffyTToan") },
    ], false),
    "FluffyDSHHDVu": o([
        { json: "HHDVu", js: "HHDVu", typ: a(r("HHDVuElement")) },
    ], false),
    "FluffyTToan": o([
        { json: "TgTTTBSo", js: "TgTTTBSo", typ: "" },
        { json: "TgTTTBChu", js: "TgTTTBChu", typ: "" },
    ], false),
    "FluffyTTChung": o([
        { json: "PBan", js: "PBan", typ: "" },
        { json: "THDon", js: "THDon", typ: "" },
        { json: "KHMSHDon", js: "KHMSHDon", typ: "" },
        { json: "KHHDon", js: "KHHDon", typ: "" },
        { json: "SHDon", js: "SHDon", typ: "" },
        { json: "NLap", js: "NLap", typ: Date },
        { json: "DVTTe", js: "DVTTe", typ: "" },
        { json: "TGia", js: "TGia", typ: "" },
        { json: "TTNCC", js: "TTNCC", typ: "" },
        { json: "DDTCuu", js: "DDTCuu", typ: "" },
        { json: "MTCuu", js: "MTCuu", typ: "" },
        { json: "HTTToan", js: "HTTToan", typ: "" },
        { json: "THTTTKhac", js: "THTTTKhac", typ: "" },
    ], false),
    "Fpt": o([
        { json: "invoice", js: "invoice", typ: r("Invoice") },
    ], false),
    "Invoice": o([
        { json: "viewData", js: "viewData", typ: r("ViewData") },
        { json: "invoiceData", js: "invoiceData", typ: r("InvoiceData") },
        { json: "Signature", js: "Signature", typ: r("InvoiceSignature") },
        { json: "_xmlns:inv", js: "_xmlns:inv", typ: "" },
        { json: "_xmlns:ds", js: "_xmlns:ds", typ: "" },
    ], false),
    "InvoiceSignature": o([
        { json: "SignedInfo", js: "SignedInfo", typ: r("FluffySignedInfo") },
        { json: "SignatureValue", js: "SignatureValue", typ: "" },
        { json: "KeyInfo", js: "KeyInfo", typ: r("KeyInfo") },
        { json: "_xmlns", js: "_xmlns", typ: "" },
        { json: "_Id", js: "_Id", typ: u(undefined, "") },
    ], false),
    "FluffySignedInfo": o([
        { json: "CanonicalizationMethod", js: "CanonicalizationMethod", typ: r("CanonicalizationMethod") },
        { json: "SignatureMethod", js: "SignatureMethod", typ: r("CanonicalizationMethod") },
        { json: "Reference", js: "Reference", typ: r("Reference") },
    ], false),
    "InvoiceData": o([
        { json: "sellerAppRecordId", js: "sellerAppRecordId", typ: "" },
        { json: "invoiceAppRecordId", js: "invoiceAppRecordId", typ: "" },
        { json: "invoiceType", js: "invoiceType", typ: "" },
        { json: "templateCode", js: "templateCode", typ: "" },
        { json: "invoiceSeries", js: "invoiceSeries", typ: "" },
        { json: "invoiceNumber", js: "invoiceNumber", typ: "" },
        { json: "invoiceName", js: "invoiceName", typ: "" },
        { json: "invoiceIssuedDate", js: "invoiceIssuedDate", typ: "" },
        { json: "signedDate", js: "signedDate", typ: "" },
        { json: "submittedDate", js: "submittedDate", typ: "" },
        { json: "exchangeRate", js: "exchangeRate", typ: "" },
        { json: "currencyCode", js: "currencyCode", typ: "" },
        { json: "invoiceNote", js: "invoiceNote", typ: "" },
        { json: "adjustmentType", js: "adjustmentType", typ: "" },
        { json: "payments", js: "payments", typ: r("Payments") },
        { json: "delivery", js: "delivery", typ: r("Delivery") },
        { json: "sellerLegalName", js: "sellerLegalName", typ: "" },
        { json: "sellerTaxCode", js: "sellerTaxCode", typ: "" },
        { json: "sellerAddressLine", js: "sellerAddressLine", typ: "" },
        { json: "sellerPhoneNumber", js: "sellerPhoneNumber", typ: "" },
        { json: "sellerFaxNumber", js: "sellerFaxNumber", typ: "" },
        { json: "sellerEmail", js: "sellerEmail", typ: "" },
        { json: "sellerLegalNameFrn", js: "sellerLegalNameFrn", typ: "" },
        { json: "sellerBankName", js: "sellerBankName", typ: "" },
        { json: "sellerBankAccount", js: "sellerBankAccount", typ: "" },
        { json: "sellerContactPersonName", js: "sellerContactPersonName", typ: "" },
        { json: "sellerSignedPersonName", js: "sellerSignedPersonName", typ: "" },
        { json: "sellerSubmittedPersonName", js: "sellerSubmittedPersonName", typ: "" },
        { json: "buyerDisplayName", js: "buyerDisplayName", typ: "" },
        { json: "buyerLegalName", js: "buyerLegalName", typ: "" },
        { json: "buyerTaxCode", js: "buyerTaxCode", typ: "" },
        { json: "contractNumber", js: "contractNumber", typ: "" },
        { json: "buyerAddressLine", js: "buyerAddressLine", typ: "" },
        { json: "buyerPhoneNumber", js: "buyerPhoneNumber", typ: "" },
        { json: "buyerFaxNumber", js: "buyerFaxNumber", typ: "" },
        { json: "buyerEmail", js: "buyerEmail", typ: "" },
        { json: "buyerBankName", js: "buyerBankName", typ: "" },
        { json: "buyerBankAccount", js: "buyerBankAccount", typ: "" },
        { json: "userDefines", js: "userDefines", typ: r("UserDefines") },
        { json: "items", js: "items", typ: r("Items") },
        { json: "dateView", js: "dateView", typ: "" },
        { json: "invoiceTaxBreakdowns", js: "invoiceTaxBreakdowns", typ: r("InvoiceTaxBreakdowns") },
        { json: "totalVATAmount", js: "totalVATAmount", typ: "" },
        { json: "totalAmountWithVAT", js: "totalAmountWithVAT", typ: "" },
        { json: "totalAmountWithVATFrn", js: "totalAmountWithVATFrn", typ: "" },
        { json: "totalAmountWithVATInWords", js: "totalAmountWithVATInWords", typ: "" },
        { json: "totalAmountWithVATInWordsUnsigned", js: "totalAmountWithVATInWordsUnsigned", typ: "" },
        { json: "totalAmountWithVATInWordsFrn", js: "totalAmountWithVATInWordsFrn", typ: "" },
        { json: "CHIET_KHAU", js: "CHIET_KHAU", typ: "" },
        { json: "discountAmount", js: "discountAmount", typ: "" },
        { json: "isDiscountAmtPos", js: "isDiscountAmtPos", typ: "" },
        { json: "discountAmountFrn", js: "discountAmountFrn", typ: "" },
        { json: "isDiscountAmtPosFrn", js: "isDiscountAmtPosFrn", typ: "" },
        { json: "totalAmountWithoutVAT", js: "totalAmountWithoutVAT", typ: "" },
        { json: "totalAmountWithoutVATFrn", js: "totalAmountWithoutVATFrn", typ: "" },
        { json: "barCodeContent", js: "barCodeContent", typ: "" },
        { json: "_id", js: "_id", typ: "" },
    ], false),
    "Delivery": o([
        { json: "deliveryOrderNumber", js: "deliveryOrderNumber", typ: "" },
        { json: "UrlWebTraCuu", js: "UrlWebTraCuu", typ: "" },
        { json: "fromWarehouseName", js: "fromWarehouseName", typ: "" },
        { json: "containerNumber", js: "containerNumber", typ: "" },
    ], false),
    "InvoiceTaxBreakdowns": o([
        { json: "invoiceTaxBreakdownUnCal", js: "invoiceTaxBreakdownUnCal", typ: a(r("InvoiceTaxBreakdown")) },
        { json: "invoiceTaxBreakdown", js: "invoiceTaxBreakdown", typ: r("InvoiceTaxBreakdown") },
    ], false),
    "InvoiceTaxBreakdown": o([
        { json: "vatPercentage", js: "vatPercentage", typ: "" },
        { json: "vatTaxableAmount", js: "vatTaxableAmount", typ: "" },
        { json: "vatTaxAmount", js: "vatTaxAmount", typ: u(undefined, "") },
    ], false),
    "Items": o([
        { json: "item", js: "item", typ: a(r("Item")) },
    ], false),
    "Item": o([
        { json: "lineNumber", js: "lineNumber", typ: "" },
        { json: "itemCode", js: "itemCode", typ: "" },
        { json: "itemSoNo", js: "itemSoNo", typ: "" },
        { json: "itemName", js: "itemName", typ: "" },
        { json: "unitCode", js: "unitCode", typ: "" },
        { json: "unitName", js: "unitName", typ: "" },
        { json: "quantity", js: "quantity", typ: "" },
        { json: "unitPrice", js: "unitPrice", typ: "" },
        { json: "itemTotalAmountWithoutVat", js: "itemTotalAmountWithoutVat", typ: "" },
        { json: "vatPercentage", js: "vatPercentage", typ: "" },
        { json: "vatAmount", js: "vatAmount", typ: "" },
        { json: "THANH_TIEN_SAU_CK", js: "THANH_TIEN_SAU_CK", typ: "" },
        { json: "SO_LO", js: "SO_LO", typ: "" },
        { json: "HAN_DUNG", js: "HAN_DUNG", typ: "" },
    ], false),
    "Payments": o([
        { json: "payment", js: "payment", typ: r("Payment") },
    ], false),
    "Payment": o([
        { json: "paymentMethodName", js: "paymentMethodName", typ: "" },
        { json: "paymentNote", js: "paymentNote", typ: "" },
    ], false),
    "UserDefines": o([
        { json: "SUBJECT", js: "SUBJECT", typ: "" },
        { json: "NGUOI_THU_HUONG", js: "NGUOI_THU_HUONG", typ: "" },
        { json: "SO_TAI_KHOAN_NTH", js: "SO_TAI_KHOAN_NTH", typ: "" },
        { json: "TEN_NGAN_HANG_NTH", js: "TEN_NGAN_HANG_NTH", typ: "" },
        { json: "DIA_CHI_NGAN_HANG_NTH", js: "DIA_CHI_NGAN_HANG_NTH", typ: "" },
        { json: "SWIFT_CODE", js: "SWIFT_CODE", typ: "" },
        { json: "PROJECT_CODE", js: "PROJECT_CODE", typ: "" },
        { json: "INVOICE_SUB_TYPE", js: "INVOICE_SUB_TYPE", typ: "" },
        { json: "IS_IMPORT", js: "IS_IMPORT", typ: "" },
        { json: "REF_DOC_NO", js: "REF_DOC_NO", typ: "" },
        { json: "PAYMENT_TYPE_IN_WORDS", js: "PAYMENT_TYPE_IN_WORDS", typ: "" },
        { json: "PAY_TO_TYPE", js: "PAY_TO_TYPE", typ: "" },
        { json: "ProjectPhone", js: "ProjectPhone", typ: "" },
        { json: "REF_NO", js: "REF_NO", typ: "" },
        { json: "PAYMENT_NOTES", js: "PAYMENT_NOTES", typ: "" },
        { json: "THOI_HAN_THANH_TOAN", js: "THOI_HAN_THANH_TOAN", typ: "" },
        { json: "TONG_DA_THANH_TOAN", js: "TONG_DA_THANH_TOAN", typ: "" },
        { json: "CHECK_NO", js: "CHECK_NO", typ: "" },
        { json: "MA_CN", js: "MA_CN", typ: "" },
        { json: "TEN_CN", js: "TEN_CN", typ: "" },
        { json: "SO_BIEN_LAI", js: "SO_BIEN_LAI", typ: "" },
        { json: "SO_HOP_DONG", js: "SO_HOP_DONG", typ: "" },
        { json: "SDB", js: "SDB", typ: "" },
        { json: "MLT", js: "MLT", typ: "" },
        { json: "DUEDATE", js: "DUEDATE", typ: "" },
    ], false),
    "ViewData": o([
        { json: "printType", js: "printType", typ: "" },
    ], false),
    "Vnpt": o([
        { json: "Invoice", js: "Invoice", typ: r("InvoiceClass") },
    ], false),
    "InvoiceClass": o([
        { json: "Content", js: "Content", typ: r("Content") },
        { json: "Signature", js: "Signature", typ: r("InvoiceSignature") },
        { json: "XsltFile", js: "XsltFile", typ: u(undefined, "") },
        { json: "RegisTemp", js: "RegisTemp", typ: u(undefined, "") },
        { json: "RowPerPage", js: "RowPerPage", typ: u(undefined, "") },
        { json: "qrCodeData", js: "qrCodeData", typ: u(undefined, "") },
    ], false),
    "Content": o([
        { json: "ArisingDate", js: "ArisingDate", typ: "" },
        { json: "InvoiceName", js: "InvoiceName", typ: "" },
        { json: "InvoicePattern", js: "InvoicePattern", typ: "" },
        { json: "SerialNo", js: "SerialNo", typ: "" },
        { json: "InvoiceNo", js: "InvoiceNo", typ: "" },
        { json: "Kind_of_Payment", js: "Kind_of_Payment", typ: u(undefined, "") },
        { json: "ComName", js: "ComName", typ: "" },
        { json: "ComTaxCode", js: "ComTaxCode", typ: "" },
        { json: "ComAddress", js: "ComAddress", typ: "" },
        { json: "ComPhone", js: "ComPhone", typ: "" },
        { json: "ComBankNo", js: "ComBankNo", typ: "" },
        { json: "ComBankName", js: "ComBankName", typ: "" },
        { json: "CusCode", js: "CusCode", typ: "" },
        { json: "CusName", js: "CusName", typ: "" },
        { json: "CusTaxCode", js: "CusTaxCode", typ: "" },
        { json: "CusPhone", js: "CusPhone", typ: "" },
        { json: "CusAddress", js: "CusAddress", typ: "" },
        { json: "CusBankName", js: "CusBankName", typ: "" },
        { json: "CusBankNo", js: "CusBankNo", typ: "" },
        { json: "Total", js: "Total", typ: "" },
        { json: "VAT_Amount", js: "VAT_Amount", typ: u(undefined, "") },
        { json: "Amount", js: "Amount", typ: "" },
        { json: "Amount_words", js: "Amount_words", typ: u(undefined, "") },
        { json: "GrossValueNonTax", js: "GrossValueNonTax", typ: u(undefined, "") },
        { json: "GrossValue", js: "GrossValue", typ: "" },
        { json: "Buyer", js: "Buyer", typ: "" },
        { json: "GrossValue0", js: "GrossValue0", typ: "" },
        { json: "VATAmount0", js: "VATAmount0", typ: u(undefined, "") },
        { json: "GrossValue5", js: "GrossValue5", typ: "" },
        { json: "VATAmount5", js: "VATAmount5", typ: u(undefined, "") },
        { json: "GrossValue10", js: "GrossValue10", typ: "" },
        { json: "VATAmount10", js: "VATAmount10", typ: u(undefined, "") },
        { json: "CurrencyUnit", js: "CurrencyUnit", typ: "" },
        { json: "ExchangeRate", js: "ExchangeRate", typ: "" },
        { json: "ConvertedAmount", js: "ConvertedAmount", typ: u(undefined, "") },
        { json: "Extra1", js: "Extra1", typ: u(undefined, "") },
        { json: "Extra2", js: "Extra2", typ: u(undefined, "") },
        { json: "EmailDeliver", js: "EmailDeliver", typ: u(undefined, "") },
        { json: "SMSDeliver", js: "SMSDeliver", typ: u(undefined, "") },
        { json: "VAT_Rate", js: "VAT_Rate", typ: u(undefined, "") },
        { json: "KindOfService", js: "KindOfService", typ: u(undefined, "") },
        { json: "Products", js: "Products", typ: r("Products") },
        { json: "Extra", js: "Extra", typ: "" },
        { json: "SignDate", js: "SignDate", typ: "" },
        { json: "_Id", js: "_Id", typ: "" },
        { json: "Key", js: "Key", typ: u(undefined, "") },
        { json: "ComFax", js: "ComFax", typ: u(undefined, "") },
        { json: "ComEmail", js: "ComEmail", typ: u(undefined, "") },
        { json: "Ikey", js: "Ikey", typ: u(undefined, "") },
        { json: "ParentName", js: "ParentName", typ: u(undefined, "") },
        { json: "PaymentMethod", js: "PaymentMethod", typ: u(undefined, "") },
        { json: "VATAmount", js: "VATAmount", typ: u(undefined, "") },
        { json: "AmountInWords", js: "AmountInWords", typ: u(undefined, "") },
        { json: "VATRate", js: "VATRate", typ: u(undefined, "") },
        { json: "Note", js: "Note", typ: u(undefined, "") },
        { json: "CusEmails", js: "CusEmails", typ: u(undefined, "") },
        { json: "VatAmount0", js: "VatAmount0", typ: u(undefined, "") },
        { json: "VatAmount5", js: "VatAmount5", typ: u(undefined, "") },
        { json: "VatAmount10", js: "VatAmount10", typ: u(undefined, "") },
        { json: "GrossValueNDeclared", js: "GrossValueNDeclared", typ: u(undefined, "") },
        { json: "VatAmountNDeclared", js: "VatAmountNDeclared", typ: u(undefined, "") },
        { json: "GrossValueContractor", js: "GrossValueContractor", typ: u(undefined, "") },
        { json: "VatAmountContractor", js: "VatAmountContractor", typ: u(undefined, "") },
        { json: "PortalLink", js: "PortalLink", typ: u(undefined, "") },
        { json: "Hidden", js: "Hidden", typ: u(undefined, "") },
    ], false),
    "Products": o([
        { json: "Product", js: "Product", typ: u(a(r("ProductElement")), r("PurpleProduct")) },
    ], false),
    "ProductElement": o([
        { json: "Code", js: "Code", typ: "" },
        { json: "Extra1", js: "Extra1", typ: "" },
        { json: "Extra2", js: "Extra2", typ: "" },
        { json: "Remark", js: "Remark", typ: "" },
        { json: "Total", js: "Total", typ: "" },
        { json: "ProdName", js: "ProdName", typ: "" },
        { json: "ProdUnit", js: "ProdUnit", typ: "" },
        { json: "ProdQuantity", js: "ProdQuantity", typ: "" },
        { json: "ProdPrice", js: "ProdPrice", typ: "" },
        { json: "Discount", js: "Discount", typ: "" },
        { json: "DiscountAmount", js: "DiscountAmount", typ: "" },
        { json: "VATRate", js: "VATRate", typ: "" },
        { json: "VATAmount", js: "VATAmount", typ: "" },
        { json: "Amount", js: "Amount", typ: "" },
    ], false),
    "PurpleProduct": o([
        { json: "Code", js: "Code", typ: "" },
        { json: "ProdName", js: "ProdName", typ: "" },
        { json: "ProdPrice", js: "ProdPrice", typ: "" },
        { json: "ProdQuantity", js: "ProdQuantity", typ: "" },
        { json: "ProdType", js: "ProdType", typ: "" },
        { json: "ProdUnit", js: "ProdUnit", typ: "" },
        { json: "Extra", js: "Extra", typ: "" },
        { json: "Total", js: "Total", typ: "" },
        { json: "Amount", js: "Amount", typ: "" },
        { json: "IsDiscountRow", js: "IsDiscountRow", typ: "" },
    ], false),
    "TSuat": [
        "KCT",
        "10%",
        "5%",
        "0%"
    ],
    "KDLieu": [
        "DateTime",
        "Int16",
        "Int32",
        "Int64",
        "String",
        "Decimal",
        "Date"
    ],
};

Object.byString = function (o, option) {
    var result;
    var type = option.type === "Date" ? Date : option.type === "String" ? String : option.type === "Number" ? Number : option.type === "Boolean" ? Boolean : String;
    o = eval("o." + option.key);

    if (typeof o == "undefined" && option["default"] != undefined && option["default"] != null)
        return option["default"];
    if (!o)
        return;
    if (type === Date) {
        result = FormatDate1(o);
    }
    else if (o.includes('%') || o == "KCT")
        result = type(o.toString().replace('%', '')).valueOf();
    else
        result = type(o).valueOf();
    if ((Number.isNaN(result) || typeof result == "undefined") && option["default"] != undefined && option["default"] != null)
        return option["default"];
    if ((Number.isNaN(result) || typeof result == "undefined" || result == null) && option.required)
        throw new Error('Undefined');
    return result;
};

Object.byPath = function (o, p) {
    return eval("o." + p);
};

function MapToSmartVasObj(type, InObject) {
    var mapObj = eval(AvailableMaps.find(function (e) { return e.name == type; }));
    var myMap = new Map(Object.entries(mapObj.obj));
    var result = {};
    try {
        myMap.forEach(function (key, index) {
            if (typeof key.key === 'string') {
                result[index] = Object.byString(InObject, key);
            }
            else if (typeof key.key === 'object') {
                var detailsObj = [Object.byPath(InObject, key.path_to)];
                var detailKey = key.key;
                var MapDetails = new Map(Object.entries(detailKey));
                var details = [];
                detailsObj.every(function (e) {
                    var detail = {};
                    MapDetails.forEach(function (k, i) {
                        detail[i] = Object.byString(e, k);
                    });
                    details.push(detail);
                });
                result['DetailJson'] = JSON.stringify(details);
                result['Details'] = details;
            }
        });
        return result;
    }
    catch (err) {
        console.log(err);
    }
}

var SymbolRegx = new RegExp('[A-Z][A-Z]\/[0-9][0-9][A-Z]', 'i');
var TemptCodeRegx = new RegExp('[0][0-9][A-Z][A-Z][A-Z][A-Z][0-1]\/[0-9][0-9][0-9]', 'i');
var LetterRegx = new RegExp("[a-zA-Z]", "i");
async function PredictMap(InObject) {
    if (typeof InObject == "string") {
        try {
            InObject = JSON.parse(InObject);
        }
        catch (err) {
            console.log(err);
            throw new Error('Object is not valid');
        }
    }
    let result = {};
    var InvoiceGeneralInfo = [];
    var InvoiceMoneyInfo = [];
    var InvoiceDetails = [];
    var InvoiceTaxes = [];
    var Others = [];
    async function goThroughEachKey(obj) {
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
                if (isDate(value) || key.toLowerCase().includes("date"))
                    InvoiceGeneralInfo.push({ key: key, value: value, type: Date });
                else if ((key.toLowerCase().includes('taxcode') || key.toLowerCase().includes('cuscode')) && isTaxCode(value) && (result.CompanyTaxcode == undefined || result.CompanyTaxcode == null || result.CompanyTaxcode == ''))
                    result.CompanyTaxcode = value;
                else if ((key.toLowerCase().includes('taxcode') || key.toLowerCase().includes('cuscode')) && isTaxCode(value) && (result.SellerTaxCode == undefined || result.SellerTaxCode == null || result.SellerTaxCode == ''))
                    result.SellerTaxCode = value;
                else if (key.toLowerCase().includes('phone') && isNumber(value)) {
                    if (result.Phone == null || result.Phone == undefined || result.Phone == "")
                        result.Phone = value;
                    else if (result.SellerPhoneNumber == null || result.SellerPhoneNumber == undefined || result.SellerPhoneNumber == "")
                        result.SellerPhoneNumber = value;
                }
                else if (key.toLowerCase().includes('fax') && isNumber(value)) {
                    if (result.Fax == null || result.Fax == undefined || result.Fax == "")
                        result.Fax = value;
                    else if (result.SellerFax == null || result.SellerFax == undefined || result.SellerFax == "")
                        result.SellerFax = value;
                }
                else if (isNumber(value)) {
                    if (key.toString().toUpperCase().includes("NO") || value.split('.').length > 2 || value.startsWith("00")) InvoiceGeneralInfo.push({ key: key, value: value, type: Number });
                    else InvoiceMoneyInfo.push({ key: key, value: value, type: Number });

                }
                else
                    InvoiceGeneralInfo.push({ key: key, value: value, type: String });
            }
            else if (typeof value == 'number') {
                var value_1 = new Number(eval("obj." + key));
                if (key.toString().toUpperCase().includes("NO") || value.split('.').length > 2 || value.startsWith("00")) InvoiceGeneralInfo.push({ key: key, value: value_1, type: Number });
                else InvoiceMoneyInfo.push({ key: key, value: value_1, type: Number });
            }
            else if (Array.isArray(value) || value instanceof Array) {
                var arrayCheck = eval("obj." + key);
                var isObject_1 = false;
                var shouldSkip_1 = false;
                arrayCheck.forEach(function (e) {
                    if (shouldSkip_1)
                        return;
                    if (!(typeof e === 'object' || e instanceof Object)) {
                        isObject_1 = false;
                        shouldSkip_1 = true;
                        return;
                    }
                    else
                        isObject_1 = true;
                });
                if (isObject_1 && InvoiceDetails && InvoiceDetails.length > 0) {
                    arrayCheck.forEach(function (e) { return InvoiceTaxes.push({ key: key, value: e }); });
                }
                else if (isObject_1)
                    arrayCheck.forEach(function (e) { return InvoiceDetails.push({ key: key, value: e }); });
            }
            else if (typeof value === 'object') {
                for (var _c = 0, _d = Object.entries(value); _c < _d.length; _c++) {
                    var _e = _d[_c], subkey = _e[0], subvalue = _e[1];
                }
                goThroughEachKey(value, null);
            }
            else
                Others.push({ key: key, value: value });
        };
        return
    }
    await goThroughEachKey(InObject
        // , function () {
        // InvoiceGeneralInfo.forEach(function (e) {
        //     if (SymbolRegx.test(e.value.toString()) && e.value.length === 6)
        //         result.Symbol = e.value;
        //     else if (TemptCodeRegx.test(e.value.toString()) && e.value.length === 11)
        //         result.TemptCode = e.value;
        // });
        // console.log("InvoiceMoneyInfo", InvoiceMoneyInfo);
        // // InvoiceMoneyInfo.forEach(e => {
        // // })
        // console.log("InvoiceDetails", InvoiceDetails);
        // console.log("Others", Others);
        // console.log("InvoiceTaxes", InvoiceTaxes);
        // console.log(result);
        // return result;
        //}
    );
    await InvoiceGeneralInfo.forEach(function (e) {
        if (SymbolRegx.test(e.value.toString()) && e.value.length === 6)
            result.Symbol = e.value;
        else if (TemptCodeRegx.test(e.value.toString()) && e.value.length === 11)
            result.TemptCode = e.value;
    });
    console.log("InvoiceMoneyInfo", InvoiceMoneyInfo);
    // InvoiceMoneyInfo.forEach(e => {
    // })
    console.log("InvoiceDetails", InvoiceDetails);
    console.log("Others", Others);
    console.log("InvoiceTaxes", InvoiceTaxes);
    console.log(result);

    async function checkTotalMoney(MoneyArray, check) {
        if (check == true) {
            for (var a = 0; a < MoneyArray.length; a++) {
                for (var b = 0; b < MoneyArray.length; b++) {
                    for (var c = 0; c < MoneyArray.length; c++) {
                        if (a == b || b == c || a == c) continue;

                        var TotalMoneyNoTax = parseFloat(MoneyArray[a].value)
                        var MoneyTax = parseFloat(MoneyArray[b].value)
                        var TotalMoney = parseFloat(MoneyArray[c].value)
                        if (parseFloat(MoneyArray[a].value) + parseFloat(MoneyArray[b].value) == parseFloat(MoneyArray[c].value)
                            && TotalMoneyNoTax > 1 && MoneyTax > 1 && TotalMoney > 1) {
                            return {
                                TotalMoneyNoTax: TotalMoneyNoTax,
                                MoneyTax: MoneyTax,
                                TotalMoney: TotalMoney
                            }
                        }
                    }
                }
            }
        }
        else {
            for (var a = 0; a < MoneyArray.length; a++) {
                for (var b = 0; b < MoneyArray.length; b++) {
                    for (var c = 0; c < MoneyArray.length; c++) {
                        if (a == b || b == c || a == c) continue;
                        var TotalMoneyNoTax = parseFloat(MoneyArray[a].value)
                        var MoneyTax = parseFloat(MoneyArray[b].value)
                        var TotalMoney = parseFloat(MoneyArray[c].value)
                        if (parseFloat(MoneyArray[a].value) + parseFloat(MoneyArray[b].value) == parseFloat(MoneyArray[c].value)) {
                            return {
                                TotalMoneyNoTax: TotalMoneyNoTax,
                                MoneyTax: MoneyTax,
                                TotalMoney: TotalMoney
                            }
                        }
                    }
                }
            }
        }
    }
    InvoiceMoneyInfo.sort().reverse();
    var total = await checkTotalMoney(InvoiceMoneyInfo, true);
    if (!total) total = await checkTotalMoney(InvoiceMoneyInfo, false);
    result.TotalMoneyNoTax = total.TotalMoneyNoTax > total.MoneyTax ? total.TotalMoneyNoTax : total.MoneyTax;
    result.MoneyTax = total.TotalMoneyNoTax < total.MoneyTax ? total.TotalMoneyNoTax : total.MoneyTax;
    result.TotalMoney = total.TotalMoney;


    return result;
}
function isDate(date) {
    return ((new Date(date).toString() !== "Invalid Date") && (!isNaN(Date.parse(date))) && (Date.parse(date) > parseInt(new Date(1 / 1 / 1970).toString()) && Date.parse(date) < parseInt(new Date().toString())));
}
function isTaxCode(taxcode) {
    taxcode = taxcode.replace(/\s/g, '');
    return ((taxcode.length === 10 || (taxcode.length === 13 && taxcode.includes('-'))) && !taxcode.includes('.') && !isNaN(parseFloat(taxcode)));
}
function isNumber(number) {
    return (!isNaN(parseFloat(number)) && !LetterRegx.test(number));
}
var AvailableMaps = [];
const Supported = ['VNPT', 'FPT', '92TBTCT', '19KHCT'];
var openFile = async function (event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function () {
        try {
            var text = reader.result;
            text = text.replace(/<DSCKS.*DSCKS>/, '')
            text = text.replace(/<Signature.*Signature>/, '')
            //console.log(xmlDoc.getElementsByTagName("DSCKS").forEach(e => e.remove()))
            //console.log(xmlDoc.getElementsByTagName("Signature").forEach(e => e.remove()))
            if (text.includes("inv:")) text = text.replaceAll("inv:", "")
            var data = convertXML2JSON(text);
            var obj = ConvertToObject(data);
        }
        catch (err) {
            console.log(err)
        }
    };
    reader.readAsText(input.files[0]);
};
function convertXML2JSON(data) {
    var xmlData = "";
    if (data !== null && data.trim().length !== 0) {
        try {
            xmlData = $.parseXML(data);
        } catch (e) {
            throw e;
        }
        var x2js = new X2JS();
        return JSON.stringify(x2js.xml2json(xmlData));
    }
}
async function ConvertToObject(json, map) {
    var result = {};
    for (var i = 0; i < Supported.length; i++) {
        try {
            //let data = ToOject(json, Supported[i]);
            //result = MapToSmartVasObj(Supported[i], data)
            result = await PredictMap(json)
            DisplayInvoice(result)
        }
        catch (err) {
            console.log(err)
            continue;
        }
    }
}

$(document).ready(function () {
    $.ajax({
        dataType: "json",
        url: './Maps/',
        success: (res) => {
            res.forEach(e => {
                $.ajax({
                    dataType: "json",
                    url: `./Maps/${e}`,
                    success: (data) => {
                        var obj = { name: `${e.replace('.json', '')}`, obj: data }
                        AvailableMaps.push(obj)
                    },
                    error: err => {
                        console.log(err)
                    }
                })
            });
        }
    });
})
function GenarateDetails(details) {
    var content = "";
    details.forEach((e, index) => {
        content += "<tr>";
        content += `<td>${(index + 1)}</td>`;
        content += `<td>${e.ProductName}</td>`;
        content += `<td>${e.Unit}</td>`;
        content += `<td>${FormatMoney(e.Number)}</td>`;
        content += `<td>${FormatMoney(e.Price)}</td>`;
        content += `<td>${FormatMoney(e.Tax)}</td>`;
        content += `<td>${FormatMoney(e.TotalMoney)}</td>`;
        content += `<td>${FormatMoney(e.Tax == "-1" || e.Tax == "KCT" ? e.TotalMoney : (e.TotalMoney + e.TotalMoney * e.Tax))}</td>`;
        content += "</tr>";
    })
    return content;
}
function DisplayInvoice(invoice) {
    $("#invoice-details").empty();
    if (invoice) {

        $("#InvoiceType").text(InvoiceType(invoice.TemptCode));
        var date = FormatDate2(invoice.DateofInvoice)
        $("#DateofInvoice").text(`Ngày lập: ${date}`);

        $("#TemptCode").html(invoice.TemptCode)
        $("#Symbol").html(invoice.Symbol)
        $("#InvoiceNumber").html(invoice.InvoiceNumber?.toString().padStart(7, 0))
        $("#IvoiceCode").html(invoice.IvoiceCode)

        $("#SellerName").html(invoice.SellerName)
        $("#SellerTaxCode").html(invoice.SellerTaxCode)
        $("#SellerAddress").html(invoice.SellerCompanyAddress)
        $("#BuyerTaxCode").html(invoice.CompanyTaxcode)
        $("#BuyerAddress").html(invoice.CompanyAdd)
        $("#BuyerName").html(invoice.CompanyName)

        $("#MoneyCode").html(invoice.MoneyCode)
        $("#ExchangeRate").html(invoice.ExchangeRate == 1 ? "1.00" : FormatMoney(invoice.ExchangeRate))
        $("#PaymentTerm").html(invoice.PaymentTerm)

        $("#TotalMoneyNoTax").html(FormatMoney(invoice.TotalMoneyNoTax))
        $("#MoneyTax").html(FormatMoney(invoice.MoneyTax))
        $("#TotalMoney").html(FormatMoney(invoice.TotalMoney))

        var details = invoice.Details;
        if (details && details.length > 0) {
            $("#invoice-details").append(GenarateDetails(details))
        }
    }
}
function InvoiceType(code) {
    return code.includes("01GTKT") ? "Hóa đơn giá trị gia tăng" : code.includes("02GTTT") ? "Hóa đơn bán hàng" : code.includes("03XKNB") ? "Phiếu xuất kho kiêm vận chuyển nội bộ" : "Hóa đơn khác"
}
function FormatDate1(o) {
    var date = new Date(o);
    var dateStr = ("00" + date.getDate()).slice(-2) + "/" +
        ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
        date.getFullYear() + " " +
        ("00" + date.getHours()).slice(-2) + ":" +
        ("00" + date.getMinutes()).slice(-2) + ":" +
        ("00" + date.getSeconds()).slice(-2);
    return dateStr;
}
function FormatDate2(date) {
    if (!date) return
    if (new Date(date) && new Date(date) != "Invalid Date") date = new Date(date)
    else return date.toString().split(" ")[0]
    if (isDate(date)) {
        var dateStr = ("00" + date.getDate()).slice(-2) + "/" +
            ("00" + (date.getMonth() + 1)).slice(-2) + "/" +
            date.getFullYear()
        return dateStr;
    }
    return null;
}
function FormatMoney(amount, kytuNgan, kytuThapPhan) {
    if (!amount) return '';
    var num_parts = amount.toString().split(".");
    num_parts[0] = num_parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, kytuNgan || ",");
    if (num_parts.length > 1) return num_parts.join(kytuThapPhan || ".");
    return num_parts[0];
}