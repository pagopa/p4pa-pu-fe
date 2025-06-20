export const styles = {
  paper: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 2,
    padding: 1,
    paddingTop: 0,
    margin: 0,
    top: '38%',
    right: '5%',
    zIndex: 50,
    width: 140,
    height: 122
  },
  closeStack: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  closeButton: {
    fontSize: 16,
    fontWeight: 700,
    color: 'text.primary'
  },
  contentStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end', // fixed typo from 'jsustifyContent'
    textAlign: 'center',
    padding: 0,
    paddingBottom: 1,
    gap: 1,
    color: 'action.active'
  }
};
