from selenium import webdriver

import unittest
from selenium.common.exceptions import NoSuchElementException


class NewVisitorTest(unittest.TestCase):
    HOST_ROOT = 'http://localhost:8080/url_retriever/'

    def setUp(self):
        self.browser = webdriver.Firefox()
        self.browser.implicitly_wait(3)

    def tearDown(self):
        self.browser.quit()

    def test_home_page_shows_input(self):
        # Open the homepage
        self.browser.get(self.HOST_ROOT)

        # User should see a box to input a web url
        input_box = self.browser.find_element_by_css_selector('.url_input input')
        # input_box = self.browser.find_elements_by_tag_name('input')

        self.assertIsNotNone(input_box)
        self.assertTrue('Url' in self.browser.find_element_by_css_selector('.url_input label').text)

        self.browser.find_element_by_css_selector('.url_input button').click()

        self.assertGreater(len(self.browser.find_elements_by_css_selector('.url_summary ul li')), 0)

        tag = self.browser.find_elements_by_css_selector('.url_summary ul li')[0]
        tag.click()



if __name__ == '__main__':
    unittest.main()
