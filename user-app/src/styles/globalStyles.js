import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerStyle: {
    backgroundColor: Colors.secondary,
  },
  headerTintColor: Colors.primary,
  headerTitleStyle: {
    color: Colors.primary,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.secondary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
}); 