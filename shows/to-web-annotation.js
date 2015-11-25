function(doc, req) {
  // https://github.com/jbt/js-crypto/blob/master/sha1.js
  // License: http://licence.visualidiot.com/
  var sha1 = function (str1){
    for (
      var blockstart = 0,
        i = 0,
        W = [],
        A, B, C, D, F, G,
        H = [A=0x67452301, B=0xEFCDAB89, ~A, ~B, 0xC3D2E1F0],
        word_array = [],
        temp2,
        s = unescape(encodeURI(str1)),
        str_len = s.length;

      i <= str_len;
    ){
      word_array[i >> 2] |= (s.charCodeAt(i)||128) << (8 * (3 - i++ % 4));
    }
    word_array[temp2 = ((str_len + 8) >> 6 << 4) + 15] = str_len << 3;

    for (; blockstart <= temp2; blockstart += 16) {
      A = H; i = 0;

      for (; i < 80;
        A = [[
          (G = ((s = A[0]) << 5 | s >>> 27) + A[4] + (W[i] = (i<16) ? ~~word_array[blockstart + i] : G << 1 | G >>> 31) + 1518500249) + ((B = A[1]) & (C = A[2]) | ~B & (D = A[3])),
          F = G + (B ^ C ^ D) + 341275144,
          G + (B & C | B & D | C & D) + 882459459,
          F + 1535694389
        ][0|((i++) / 20)] | 0, s, B << 30 | B >>> 2, C, D]
      ) {
        G = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
      }

      for(i = 5; i; ) H[--i] = H[i] + A[i] | 0;
    }

    for(str1 = ''; i < 40; )str1 += (H[i >> 3] >> (7 - i++ % 8) * 4 & 15).toString(16);
    return str1;
  };

  var annotation = {
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    id: 'mid:',
    motivation: "commenting",
    target: '',
    body: [],
    creator: {
      type: 'Person',
      name: ''
    },
    generator: {
      id: 'http://github.com/bigbluehat/anno-mail',
      type: 'Software',
      name: 'AnnoMail v0.0.1'
    }
  };

  if ('mandrill_events' in doc
      && doc.mandrill_events.length > 0
      && doc.mandrill_events[0]['event'] === 'inbound') {
    // let's assume (rashly) that there's only one event
    var msg = doc.mandrill_events[0].msg;
    // add the person annotating
    //annotation.creator.email = 'mailto:' + msg.from_email;
    annotation.creator['foaf:mbox_sha1sum'] = sha1('mailto:' + msg.from_email);
    annotation.creator.name = msg.from_name;

    // set the annotation target to the subject
    annotation.target = msg.subject.trim();

    // use the Message-ID as the URN/URI http://tools.ietf.org/html/rfc2392
    var msg_id = msg.headers['Message-Id'];
    annotation.id += msg_id.substr(1, msg_id.length-2);

    // set the body to the...body...go figure!
    // well...let's support multiple bodies day one!
    // because why not!
    annotation.body.push({
      type: 'TextualBody',
      value: msg.text,
      format: 'text/plain'
    });
    // loop through attachments, add those as bodies
    if ('attachments' in msg) {
      for (var name in msg.attachments) {
        var a = msg.attachments[name];
        annotation.body.push({
          // TODO: figure out where I can keep the filename...
          type: 'Embedded',
          // TODO: ...this is a base64 encoded string...
          // ...maybe we do need cnt:ContentAsBase64
          // http://www.w3.org/TR/Content-in-RDF10/#ContentAsBase64Class
          value: a.content,
          format: a.type
        });
      }
    }

    function jsonResponse() {
      return JSON.stringify(annotation);
    }
    // TODO: set proper media types, etc.
    registerType('json-ld', 'application/ld+json');
    provides('json-ld', jsonResponse);
    provides('json', jsonResponse);
  }
}
