function base64ToBigint(b64) {
  var bin = atob(b64);
  var hex = [];

  bin.split("").forEach(function (ch) {
    var h = ch.charCodeAt(0).toString(16);
    if (h.length % 2) {
      h = "0" + h;
    }
    hex.push(h);
  });

  return BigInt("0x" + hex.join(""));
}

function bigintToBase64(bn) {
  var hex = BigInt(bn).toString(16);
  if (hex.length % 2) {
    hex = "0" + hex;
  }

  var bin = [];
  var i = 0;
  var d;
  var b;
  while (i < hex.length) {
    d = parseInt(hex.slice(i, i + 2), 16);
    b = String.fromCharCode(d);
    bin.push(b);
    i += 2;
  }

  return btoa(bin.join(""));
}

function atob(b64) {
  return Buffer.from(b64, "base64").toString("binary");
}

function btoa(bin) {
  return Buffer.from(bin, "binary").toString("base64");
}

module.exports = {
  base64ToBigint,
  bigintToBase64,
};
