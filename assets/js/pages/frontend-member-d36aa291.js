"use strict";

const purchaseHistoryView = (purchaseList) => {
    let purchaseView = "";
    const xCountry = $('meta[name="x-country-code"]').attr("content") || "US";
    purchaseList = Array.isArray(purchaseList) ? purchaseList : [];
    purchaseList.forEach((item) => {
        const payAmount = item.pay_amount;
        const payCurrency = item.pay_currency_code;
        const priceText = Topupgame.numberToIntl(payAmount, payCurrency, xCountry);
        const tileImage = Topupgame.safeImage(item.product_tile_image);
        purchaseView = `
            ${purchaseView}
            <div class="purchase-status block block-rounded" data-order-id="${item.order_id}" style="cursor: pointer;">
                <div class="block-content p-0">
                    <div class="d-flex flex-column">
                        <div class="d-flex align-items-center p-3 p-lg-4">
                            <img class="img-sq img-round-pop flex-shrink-0 me-3 me-lg-4" src="${tileImage}" alt="Product Image">
                            <div class="flex-grow-1 d-flex flex-column">
                                <span class="fw-semibold">${item.product_title}</span>
                                <span class="fs-sm">${item.denomination_name}</span>
                            </div>
                            <div class="d-flex flex-column align-items-end">
                                <span class="badge fs-xs rounded-pill mb-2 ${item.status_class}">${item.status_text}</span>
                                <span class="text-currency fw-semibold">${priceText}</span>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between fs-xs text-secondary p-2 bg-body-light d-flex align-items-center rounded-bottom">
                            <span class="fs-sm mb-0">#${item.order_id}</span>    
                            <span class="fs-sm mb-0">${item.date_text}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    return purchaseView;
};

const getPurchaseList = (page = 1) => {
    $("#userEmptyResult").addClass("d-none");
    $("#userResult").addClass("d-none");
    $("#userLoading").removeClass("d-none");
    fetch(`${location.origin}/member/api-purchase-recents?page=${page}`)
        .then((response) => response.json())
        .then((data) => {
            const purchaseList = data.data;
            $("#userResult").empty();
            if (Array.isArray(purchaseList) && purchaseList.length) {
                let resultHtml = purchaseHistoryView(purchaseList);
                resultHtml = `
                    <h4 class="mt-0 mb-4">Latest Order List</h4>
                    ${resultHtml}
                `;
                const nextPage = parseInt(data.next_page);
                const prevPage = page - 1;
                if (nextPage) {
                    if (page > 1) {
                        resultHtml = `
                            ${resultHtml}
                            <div class="d-flex align-items-center justify-content-between w-100">
                                <div data-prev-page="${prevPage}" class="prev-page d-flex justify-content-center" style="cursor: pointer;">
                                    <u class="text-primary"><span class="fw-semibold text-primary"><i class="fa fa-left ms-1"></i> Previous</span></u>
                                </div>
                                <div data-next-page="${nextPage}" class="next-page d-flex justify-content-center" style="cursor: pointer;">
                                    <u class="text-primary"><span class="fw-semibold text-primary">Next <i class="fa fa-right ms-1"></i></span></u>
                                </div>
                            </div>
                        `;
                    } else {
                        resultHtml = `
                            ${resultHtml}
                            <div class="d-flex align-items-center justify-content-end w-100">
                                <div data-next-page="${nextPage}" class="next-page d-flex justify-content-center" style="cursor: pointer;">
                                    <u class="text-primary"><span class="fw-semibold text-primary">Next <i class="fa fa-right ms-1"></i></span></u>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    if (page > 1) {
                        resultHtml = `
                            ${resultHtml}
                            <div class="d-flex align-items-center justify-content-start w-100">
                                <div data-prev-page="${prevPage}" class="prev-page d-flex justify-content-center" style="cursor: pointer;">
                                    <u class="text-primary"><span class="fw-semibold text-primary"><i class="fa fa-left ms-1"></i> Previous</span></u>
                                </div>
                            </div>
                        `;
                    }
                }
                $("#userEmptyResult").addClass("d-none");
                $("#userResult").html(resultHtml).removeClass("d-none");
            } else {
                $("#userResult").addClass("d-none");
                $("#userEmptyResult").removeClass("d-none");
            }
        })
        .catch((_error) => {
            $("#userResult").empty().addClass("d-none");
            $("#userEmptyResult").removeClass("d-none");
            Topupgame.helpers("jq-notify", {
                type: "danger",
                message: "Oops, something went wrong!"
            });
        })
        .finally(() => {
            $("#userLoading").addClass("d-none");
        });
};

class frontendMember {
    static init() {
        const countryCode = $("meta[name='x-country-code']").attr("content") || "US";
        const countryId = String(countryCode).toLowerCase();
        $(document)
            .on("click", ".purchase-status", function () {
                const orderId = $(this).data("order-id");
                const statusLink = `${location.origin}/${countryId}/purchase/order-status/${orderId}`;
                location.href = statusLink;
            })
            .on("click", ".prev-page", function () {
                const prevPage = parseInt($(this).data("prev-page"));
                if (prevPage) getPurchaseList(prevPage);
            })
            .on("click", ".next-page", function () {
                const nextPage = parseInt($(this).data("next-page"));
                if (nextPage) getPurchaseList(nextPage);
            });
        getPurchaseList();
    }
}

Topupgame.onLoad(frontendMember.init());
