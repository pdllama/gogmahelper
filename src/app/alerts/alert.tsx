import Button from "@components/common/button/button"
import { useAlertStore, type AlertType } from "./alert_store"
import Text from "@components/common/text/text"
import { useEffect, useRef } from "react"
import CloseButton from "@components/common/button/close_button"

export function AlertArea({}) {
    const alerts = useAlertStore(state => state.alerts)
    const remove_alert = useAlertStore(state => state.remove_alert)

    return (
        <div className="pointer-events-none w-[30%] min-w-[150px] max-w-[300px] absolute m-2 bottom-[0px] right-[0px] flex flex-col-reverse">
            {alerts.map((alert:AlertType) => 
                <Alert title={alert.title} content={alert.content} alert_id={alert.alert_id} type={alert.type} timeout={alert.timeout} remove_alert={remove_alert}/>
            )}
        </div>
    )
}

export function Alert({title='', content='', alert_id='', type='success', timeout=3, remove_alert}:AlertType & {remove_alert: (alert_id:string) => void}) {

    const color_styles = type === 'success' ? 'bg-green-300 border-green-600 text-green-950' : 
        type === 'error' ? 'bg-red-300 border-red-400 text-red-950' : 
        type === 'warning' ? 'bg-yellow-200 border-yellow-600 text-yellow-950' : 
        'bg-blue-300 border-blue-600 text-blue-950'

    const alert_ref = useRef<HTMLDivElement|null>(null)

    useEffect(() => {
        setTimeout(() => {
            const div = alert_ref.current as HTMLDivElement
            div.style.opacity = "0"
            setTimeout(() => {
                remove_alert(alert_id)
            }, (timeout/2)*1000)
        }, (timeout/2)*1000)
    }, [])

    return (
        <div style={{msTransitionProperty: 'opacity', transitionDuration: `${timeout/2}s`}} className={`w-full h-[50px] rounded-md border relative ${color_styles} pointer-events-auto flex items-center`} ref={alert_ref}>
            {!title ? 
                <Text size='md' classes="text-start p-2" bold>{content}</Text> :
            <div className='flex flex-col p-2'>
                <Text size='md' classes="text-start mb-[-3px]" bold>{title}</Text>
                <Text size='sm' classes="text-start">{content}</Text>
            </div>
            }
            <div className='w-full absolute top-[0px] flex justify-end'>
                <CloseButton
                    onClick={() => remove_alert(alert_id)}
                />
            </div>
        </div>
    )
}