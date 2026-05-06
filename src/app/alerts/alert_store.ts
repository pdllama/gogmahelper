import { create } from "zustand"
import uuid from "../util/uuid"

type AlertContents = {
    title:string,
    content:string,
    type:'success'|'error'|'warning'|'info',
    timeout:number
}

export type AlertType = AlertContents & {
    alert_id:string
}

export interface AlertStore {
    alerts: AlertType[],
    
    add_alert: (alert_data:AlertContents) => void,
    remove_alert: (alert_id:string) => void
}

export const useAlertStore = create<AlertStore>((set) => ({

    alerts: [],

    add_alert: (alert_data:AlertContents) => set((state) => ({alerts: [...state.alerts, {...alert_data, alert_id: uuid()}]})),
    remove_alert: (alert_id:string) => set((state) => ({alerts: state.alerts.filter((al:AlertType) => !(al.alert_id === alert_id))}))

}))
