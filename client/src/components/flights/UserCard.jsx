import React, { useState } from "react";
import Collapse from "react-bootstrap/Collapse";

const emptyValue = (type) => ({
  type,
  firstName: "",
  lastName: "",
  gender: "",
});

export default function UserCard({
  type = "adult",
  index = 0,
  baggageDetails,
  value,
  onChange,
}) {
  const labelType = type === "child" ? "Trẻ em" : "Người lớn";
  const title = `${labelType} ${index + 1}`;

  const filled = !!(value?.firstName && value?.lastName && value?.gender);
  const displayName = filled ? `${value.lastName} ${value.firstName}` : title;

  const [open, setOpen] = useState(false);

  const canShowPersonal = !!baggageDetails?.personal;
  const canShowCarryOn = !!baggageDetails?.carryOn;
  const canShowChecked = !!baggageDetails?.checked;

  const missingPersonalText = "Không thể thêm vật dụng cá nhân cho đơn đặt này";
  const missingCabinText =
    "Không thể thêm hành lý xách tay cho đơn đặt này, nhưng có thể hãng hàng không sẽ cho phép bạn mua sau đó";
  const missingCheckedText =
    "Không thể thêm hành lý ký gửi cho đơn đặt này, nhưng có thể hãng hàng không sẽ cho phép bạn mua sau đó";

  const v = value || emptyValue(type);

  const done = () => {
    setOpen(false);
    onChange?.(v);
  };

  return (
    <div className="border rounded-3 p-3">
      <div className="d-flex justify-content-between align-items-start">
        <div className="d-flex gap-2 align-items-center">
          <i className="bi bi-person fs-4" />
          <div>
            <div className="fw-bold">{displayName}</div>
            {filled ? <div className="small text-muted">{v.gender}</div> : null}
          </div>
        </div>

        {filled ? <i className="bi bi-check-circle-fill text-success" /> : null}
      </div>

      <button
        type="button"
        className="btn btn-outline-primary btn-sm mt-3"
        onClick={() => setOpen((x) => !x)}
      >
        {filled
          ? "Chỉnh sửa thông tin của hành khách này"
          : "Thêm thông tin khách này"}
      </button>

      <Collapse in={open}>
        <div className="border rounded-3 p-3 mt-3 bg-light">
          <div className="small fw-semibold mb-2">Bắt buộc</div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Tên</label>
              <input
                className="form-control"
                value={v.firstName}
                onChange={(e) =>
                  onChange?.({ ...v, firstName: e.target.value })
                }
              />
              <div className="small text-muted mt-1">
                Nhập chính xác như ghi trên giấy tờ tùy thân của hành khách này
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Họ</label>
              <input
                className="form-control"
                value={v.lastName}
                onChange={(e) => onChange?.({ ...v, lastName: e.target.value })}
              />
              <div className="small text-muted mt-1">
                Nhập chính xác như ghi trên giấy tờ tùy thân của hành khách này
              </div>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Giới tính ghi trên giấy tờ tùy thân
              </label>
              <select
                className="form-select"
                value={v.gender}
                onChange={(e) => onChange?.({ ...v, gender: e.target.value })}
              >
                <option value="">Chọn</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
              <div className="small text-muted mt-1">
                Các hãng hàng không và nhà cung cấp yêu cầu chúng tôi cung cấp
                thông tin này
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-3">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={done}
            >
              Xong
            </button>
          </div>
        </div>
      </Collapse>

      {/* baggage list */}
      <div className="mt-3 d-flex flex-column gap-3">
        {/* personal */}
        <div className="d-flex gap-2">
          <i className="bi bi-briefcase fs-5" />
          <div>
            {canShowPersonal ? (
              <>
                <div className="fw-semibold">
                  {baggageDetails.personal.title}
                </div>
                <div className="small text-success">Đã bao gồm</div>
                <div className="small text-muted">
                  {baggageDetails.personal.desc}
                </div>
              </>
            ) : (
              <div className="small text-muted">{missingPersonalText}</div>
            )}
          </div>
        </div>

        {/* carry-on */}
        <div className="d-flex gap-2">
          <i className="bi bi-suitcase2 fs-5" />
          <div>
            {canShowCarryOn ? (
              <>
                <div className="fw-semibold">
                  {baggageDetails.carryOn.title}
                </div>
                <div className="small text-success">Đã bao gồm</div>
                <div className="small text-muted">
                  {baggageDetails.carryOn.desc}
                </div>
              </>
            ) : (
              <div className="small text-muted">{missingCabinText}</div>
            )}
          </div>
        </div>

        {/* checked */}
        <div className="d-flex gap-2">
          <i className="bi bi-luggage fs-5" />
          <div>
            {canShowChecked ? (
              <>
                <div className="fw-semibold">
                  {baggageDetails.checked.title}
                </div>
                <div className="small text-success">Đã bao gồm</div>
                <div className="small text-muted">
                  {baggageDetails.checked.desc}
                </div>
              </>
            ) : (
              <div className="small text-muted">{missingCheckedText}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
