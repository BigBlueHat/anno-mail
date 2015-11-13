function (doc) {
  if ('mandrill_events' in doc) {
    doc.mandrill_events.forEach(function(event) {
      // subject will be considered the `target` of the annotation
      if (event.event === 'inbound'
          && 'msg' in event && 'subject' in event.msg) {
        // index on the `target` values...basically
        // we'll use the message-id as the annotation `id` value
        emit(event.msg.subject, event.msg.headers['Message-Id']);
      }
    });
  }
}
