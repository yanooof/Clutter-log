import {Tabs} from "expo-router";

//bottom tab layout configuration:
const _Layout = () => {
    return (
        <Tabs>
            <Tabs.Screen
                name="index"
                options={{
                    title: "List",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    title: "Insights",
                    headerShown: false
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    headerShown: false
                }}
            />
        </Tabs>
    )
}

export default _Layout