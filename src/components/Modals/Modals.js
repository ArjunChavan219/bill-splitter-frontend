import { useEffect, useState } from "react"
import Modal from "react-modal"

import Checkbox from "./Checkbox"
import Login from "./Login"
import Password from "./Password"

class ParentModal {
    constructor() {
        this.modalStyle = {
            content: {
                top: '50%',
                left: '50%',
                right: 'auto',
                bottom: 'auto',
                transform: 'translate(-50%, -50%)',
                width: 'fit-content',
                maxHeight: '500px',
                overflow: 'auto'
            }
        }
        const [modalIsOpen, setIsOpen] = useState(false)
        this.modalIsOpen = modalIsOpen
        this.setIsOpen = setIsOpen

        this.openModal = () => {
            this.setIsOpen(true)
        }

        this.closeModal = () => {
            this.setIsOpen(false)
        }
    }
}

function MainModal({ object, buttonClass, content, children, trigger }) {
    useEffect(() => {
        if (trigger) {
            object.setIsOpen(true)
        }
    }, [])

    return (
        <>
            {!trigger && <button onClick={object.openModal} className={`manage-button ${buttonClass}`}><span>{content}</span></button>}
            <Modal isOpen={object.modalIsOpen} onRequestClose={object.closeModal} style={object.modalStyle}>
                {children}
            </Modal>
        </>
    )
}

function LoginDiv() {
    const modal = new ParentModal()

    return (
        <>
            <MainModal object={modal} content="Login">
                <div>This is the Login Modal</div>
                <Login />
            </MainModal>
        </>
    )
}

function SignUp() {
    const modal = new ParentModal()

    return (
        <>
            <MainModal object={modal} content="Sign Up">
                <div>This is the Sign Up Modal</div>
            </MainModal>
        </>
    )
}

function ChangePassword({ password }) {
    const modal = new ParentModal()
    modal.modalStyle.top = "40%"

    return (
        <>
            <MainModal object={modal} content="Change Password">
                <div>This is the Change Password Modal</div>
                <Password password={password} onRequestClose={modal.closeModal}/>
            </MainModal>
        </>
    )
}

function SaveBill() {
    const modal = new ParentModal()
    
    return (
        <>
            <MainModal object={modal} buttonClass="save-button" content="Save" trigger={true}>
                <div style={{margin: "-20px"}}>
                <div className="flex items-center h-24 border border-gray-300 pr-4 w-full max-w-md shadow-lg">
                    <div className="flex items-center justify-center bg-gray-300 w-2 h-full" />
                    <div className="px-6">
                        <h5 className="font-semibold" style={{marginTop: "10px"}}>Save Successful</h5>
                        <p className="text-sm" style={{marginTop: "5px", marginBottom: "10px"}}>Your changes have been saved. Once confirmed, submit to lock the bill for calculation.</p>
                    </div>
                    <button onClick={modal.closeModal}>
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div></div>
            </MainModal>
        </>
    )
}

function UpdateUser({ closePage, userState }) {
    const modal = new ParentModal()
    modal.modalStyle.top = "40%"
    
    return (
        <>
            <MainModal object={modal} buttonClass="submit-button" content="Change">
                <Checkbox type={"update-users"} updateWindow={closePage} onRequestClose={modal.closeModal} userValueState={userState}/>
            </MainModal>
        </>
    )
}

function AddRemoveModal({ update, user, type, add }) {
    const modal = new ParentModal()
    modal.modalStyle.top = "40%"
    const content = type === "item-users" ? (add ? "+" : "-") : (add ? "Add" : "Remove")
    const buttonClass = (add ? "add" : "remove") + (type === "item-users" ? "-mini" : "")

    return (
        <>
            <MainModal object={modal} buttonClass={`${buttonClass}-button`} content={content}>
                { (add || user[0].length !== 0) ? (
                    <Checkbox type={type} updateWindow={update} onRequestClose={modal.closeModal} userValueState={user} add={add}/>
                ) : (
                    <div>No active {type.charAt(0).toUpperCase() + type.slice(1)}</div>
                )}
            </MainModal>
        </>
    )
}

Modal.setAppElement("#root")

export { SignUp, LoginDiv, ChangePassword, SaveBill, UpdateUser, AddRemoveModal }