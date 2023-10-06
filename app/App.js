import React, { useState, useEffect } from 'react';
import { Button, View, StyleSheet, Text } from 'react-native';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import api from './api';

export default function App() {
    const [recording, setRecording] = useState();
    const [taskID, setTaskID] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const pollForResult = async (taskID) => {
        setTaskID(taskID)
        try {
            const response = await api.get(`/get_result/${taskID}`);

            if (response.data.result) {
                Speech.speak(response.data.result);
            }
        } catch (error) {
            console.error('Failed to fetch result', error);
        } finally {
            setTaskID(null);
            setIsProcessing(false);
        }
    };

    async function prepareAudioSession() {
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: false,
        });
    }

    async function startRecording() {
        try {
            await prepareAudioSession();

            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) {
                console.error('Permissions not granted to record audio');
                return;
            }
            const { recording } = await Audio.Recording.createAsync(
                Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            setRecording(recording);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        if (recording) {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null); // Reset the recording state
            // Send the file for processing
            const formData = new FormData();
            formData.append('audio', {
                uri: uri,
                type: 'audio/wav',
                name: 'recording.wav',
            });

            try {
                const response = await api.post('/upload', formData).then(
                    response => {
                        if (response.data.task_id) {
                            setIsProcessing(true);

                            pollForResult(response.data.task_id)

                            // Start polling for results as soon as the task ID is set

                        }
                        console.log('Response:', response.data);
                    }
                );


            } catch (error) {
                console.error('Failed to upload recording', error);
            }

        }
    }

    return (
        <View style={styles.container}>
            <Button
                title={recording ? 'Stop Recording' : 'Start Recording'}
                onPress={recording ? stopRecording : startRecording}
            />
            {isProcessing && <Text>Processing... Please wait.</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    }
});