import React, { useEffect, useState } from "react"
import { useLocation, useNavigate, useOutletContext } from "react-router-dom"

import { useAuth } from "../../provider/AuthProvider"

import { AddRemoveModal, SaveBill } from "../Modals/Modals"
import Unauthorized from "../Errors/Unauthorized"


function TextInput({ shareState, outOf, quantity }) {
    const [share, setShare] = shareState
    let total
    if (typeof outOf === "number") {
        total = outOf
    } else if (outOf.endsWith("Ml")) {
        total = outOf.match(/(\d+)Ml$/)[1]*quantity
    } else if (outOf.startsWith("100%")) {
        total = 100
    } else {
        total = quantity
    }

    const [shareValue, setShareValue] = useState(share !== 0 ? share*total : 1)

    function handleChange(event) {
        setShareValue(event.target.value)
    }

    function handleExit(event) {
        let finalShare
        if (event.target.value < 1) {
            finalShare = 1
        } else if (event.target.value > total) {
            finalShare = total
        } else {
            finalShare = shareValue
        }
        setShare(finalShare/total)
        setShareValue(finalShare)
    }

    return (
        <>
            <input type="number" onBlur={handleExit} onChange={handleChange} min={1} step={1} max={total} value={shareValue}/>
            <label>{((typeof outOf === "string" && outOf.endsWith("Ml")) && (<>ml&nbsp;</>))}of {outOf}</label>
        </>
    )
}

function Dropdown({ shareState, quantity }) {
    const [share, setShare] = shareState
    const options = ["Sharing", "1", "1/2 of 1", "1/4 of 1", "3/4 of 1", "Custom", "More than 1"]
    const values = [0, 1, 0.5, 0.25, 0.75]
    if (quantity === 1) {
        options.pop()
    }

    let index = values.indexOf(share*quantity)
    if (index === -1) {
        if (Number.isInteger(share*quantity)) {
            index = 6
        } else {
            index = 5
        }
    }
    const [selection, setSelection] = useState(index)

    function handleSelection(event) {
        const value = Number(event.target.value)
        setSelection(value)
        if (value < 5) {
            setShare(values[value]/quantity)
        }
    }

    return (
        <>
            <select onChange={handleSelection} defaultValue={selection}>
                {options.map((value, itr) => (
                    <option key={"selection"+itr} value={itr}>{value}</option>
                ))}
            </select>
            {selection > 4 && (<TextInput shareState={shareState} outOf={selection === 5 ? `100% of ${quantity}` : `${quantity}`}
             quantity={quantity} share={share}/>)}
        </>
    )
}

function Dropdown2({ shareState, quantity, total }) {
    const [share, setShare] = shareState
    const options = ["Sharing", "x mL"]

    const [selection, setSelection] = useState(share === 0 ? 0 : 1)

    function handleSelection(event) {
        const value = Number(event.target.value)
        setSelection(value)
        if (value === 0) {
            setShare(0)
        }
    }

    return (
        <>
            <select onChange={handleSelection} defaultValue={selection}>
                {options.map((value, itr) => (
                    <option key={"selection"+itr} value={itr}>{value}</option>
                ))}
            </select>
            {selection === 1 && (<TextInput shareState={[share, setShare]} outOf={quantity + "x " + total} quantity={quantity}/>)}
        </>
    )
}

function ItemData({ data, itemState }) {
    const [share, setShare] = useState(data.share)
    const [userItems, setUserItems] = itemState

    useEffect(() => {
        setUserItems(userItems.map(item => {
            if (data.name !== item.name) {
                return item
            }
            let newItem = item
            newItem["share"] = share
            return newItem
        }))
    }, [share])

    let shareContent = ""
    if (data.type === "liquor") {
        shareContent = (<Dropdown2 shareState={[share, setShare]} quantity={data.quantity} total={data.name.match(/ (\d+Ml)$/)[1]}/>)
    } else if (data.type === "miscellaneous") {
        shareContent = (<TextInput shareState={[share, setShare]} outOf={data.quantity}/>)
    } else {
        shareContent = (<Dropdown shareState={[share, setShare]} quantity={data.quantity}/>)
    }

    
    return (
        <li className="table-row">
            <div className="col col-1">{data.type.charAt(0).toUpperCase() + data.type.slice(1)}</div>
            <div className="col col-2">{data.name}</div>
            <div className="col col-3">{data.quantity}</div>
            <div className="col col-4">{shareContent}</div>
        </li>
    )
}


const Bill = () => {
    const location = useLocation()
    const navigate = useNavigate()
    if (location.state === null) {
        return (<Unauthorized />)
    }
    const { name } = location.state
    const billName = name.slice(0, -9)
    const billDate = name.slice(-8)
    const { server, serverDown } = useAuth()
    const [userItems, setUserItems] = useState([])
    const [saved, setSaved] = useState(false)
    const [loading, setLoading] = useState(true)
    const LoadingScreen = useOutletContext()

    function saveItems() {
        server.updateUserBill(name, userItems).then(data => {
            setSaved(true)
        }).catch(err => {
            serverDown()
        })
    }

    function submit() {
        server.lockUserBill(name).then(data => {
            navigate("/user", {replace: true})
        }).catch(err => {
            serverDown()
        })
    }

    useEffect(() => {
        server.getUserBill(name).then(data => {
            setUserItems(data.items)
            setLoading(false)
        }).catch(err => {
            serverDown()
        })
    }, [])

    useEffect(() => {
        setSaved(false)
    }, [userItems])

    return (
        <LoadingScreen loading={loading}>
            <h2 className={"text-3xl font-semibold mb-2"}>Bill: &nbsp; {`${billName} (${billDate})`}</h2>
            <div className={"flex bg-white shadow rounded-lg"} style={{padding: "20px"}}>
                <div className={"p-4 flex-grow"}>
                    {userItems.length !== 0 && (
                        <div style={{marginBottom: "10px"}}>
                            <ul className="responsive-table">
                                <div className="parent">
                                    <li className="table-header">
                                        <div className="col col-1">Type</div>
                                        <div className="col col-2">Item</div>
                                        <div className="col col-3">Quantity</div>
                                        <div className="col col-4">Share</div>
                                    </li>
                                </div>
                                <div className="children">
                                    {userItems.map((item, itr) => <ItemData key={"item"+itr} data={item} itemState={[userItems, setUserItems]} />)}
                                </div>
                            </ul>
                        </div>
                    )}
                    <div className="btnDiv">
                        <AddRemoveModal user={[userItems, setUserItems, name]} type={"items"} add={true} />
                        {userItems.length !== 0 && (<>
                            {!saved && <button onClick={saveItems} className={`manage-button save-button`}><span>Save</span></button>}
                            {saved && (<><SaveBill /><button onClick={submit} className={`manage-button submit-button`}><span>Submit</span></button></>)}
                        </>)}
                        <AddRemoveModal user={[userItems, setUserItems, name]} type={"items"} add={false} />
                    </div>
                </div>
            </div>
        </LoadingScreen>
    )
}

export default Bill
