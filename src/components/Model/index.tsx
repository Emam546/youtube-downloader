import classNames from "classnames";
import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
export interface Props {
    open: boolean;
    children: React.ReactNode;
    title: string;
    onClose?: () => any;
}
export default function ModelPopUp({ open, title, children, onClose }: Props) {
    return (
        <>
            <Modal
                show={open}
                onHide={onClose}
                className="tw-w-screen"
                dialogClassName="tw-w-screen"
            >
                <Modal.Header
                    className="tw-text-base"
                    closeButton
                >
                    <Modal.Title className=" tw-text-base tw-font-semibold">
                        {title}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>{children}</Modal.Body>
            </Modal>
        </>
    );
}
