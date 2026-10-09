// Partner booking hand-off: after a traveller confirms a booking, send them back to the
// travel partner's site that started the booking
const config = {
    paymentApiKey: "wMqNLmyxtxAp0O34qEfMpkWWPlvema0p"
};

function PartnerHandoffHandler() {
    "use strict";

    this.returnToPartner = (req, res) => {
        return res.redirect(req.query.returnUrl);
    };
}

module.exports = PartnerHandoffHandler;
