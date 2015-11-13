function(doc, req) {
  var annotation = {
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    id: 'mid:',
    motivation: "commenting",
    target: '',
    body: [],
    creator: {
      type: 'Person',
      name: '',
      email: 'mailto:'
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
    annotation.creator.email += msg.from_email;
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
