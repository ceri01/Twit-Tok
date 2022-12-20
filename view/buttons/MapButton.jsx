import Icon from "react-native-vector-icons/FontAwesome5"
import {StyleSheet, TouchableHighlight, View} from "react-native";
import {Component} from "react";

class FontSize extends Component {
    icon = <Icon name="map-marked-alt" size={30} color="white"></Icon>

    render() {
        return (
            <View style={styles.container}>
                <TouchableHighlight style={styles.touchableHighlight} onPress={() => {
                    this.props.onPress(true);
                }}>
                    <View style={styles.button}>
                        {this.icon}
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    button: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#6200ee",
        padding: 10,
        height: 50,
        width: 50,
        borderRadius: 100
    },
    touchableHighlight: {
        borderRadius: 100
    }
});


export default FontSize;