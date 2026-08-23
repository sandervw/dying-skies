import type { ReactElement } from "react";

interface DestroyOverlayProps {
  readonly onConfirm: () => void;
  readonly onClose: () => void;
}

/** confirmation modal for permanently destroying a saved sky. */
const DestroyOverlay = ({
  onConfirm,
  onClose,
}: DestroyOverlayProps): ReactElement => {
  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal auth-form">
        <p className="text-center">Destroy this sky forever?</p>
        <button className="btn" onClick={onConfirm}>
          destroy
        </button>
        <button className="btn" onClick={onClose}>
          cancel
        </button>
      </div>
    </>
  );
};

export { DestroyOverlay };
